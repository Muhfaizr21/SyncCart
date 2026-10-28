package database

import (
	"errors"
	"log"
	"strings"
	"time"

	"github.com/Muhfaizr21/SyncCart/backend/config"
	"github.com/Muhfaizr21/SyncCart/backend/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

const DefaultSeedPassword = "Password123!"

func MigrateAndSeed(db *gorm.DB) error {
	if err := db.AutoMigrate(
		&models.User{},
		&models.Store{},
		&models.Product{},
		&models.Order{},
		&models.MarketplaceConnection{},
		&models.TeamMember{},
		&models.SyncLog{},
	); err != nil {
		return err
	}

	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(DefaultSeedPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	passwordHash := string(hashedBytes)

	// 1. Seed Super Admin account
	var superAdmin models.User
	err = db.Where("email = ?", "superadmin@synccart.id").First(&superAdmin).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		superAdmin = models.User{
			FullName:     "Super Admin SyncCart",
			Email:        "superadmin@synccart.id",
			PasswordHash: passwordHash,
			Role:         config.RoleSuperAdmin,
			Status:       "active",
		}
		if err := db.Create(&superAdmin).Error; err != nil {
			return err
		}
		log.Println("Seeded default Super Admin: superadmin@synccart.id")
	}

	// 2. Seed Seller account with default store
	var seller models.User
	err = db.Where("email = ?", "seller@synccart.id").First(&seller).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		seller = models.User{
			FullName:     "Budi Pratama",
			Email:        "seller@synccart.id",
			PasswordHash: passwordHash,
			Role:         config.RoleSeller,
			Status:       "active",
		}
		if err := db.Create(&seller).Error; err != nil {
			return err
		}
		log.Println("Seeded default Seller: seller@synccart.id")
	}

	var defaultStore models.Store
	err = db.Where("owner_id = ?", seller.ID).First(&defaultStore).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		defaultStore = models.Store{
			OwnerID:           seller.ID,
			StoreName:         "Toko Nusantara Official",
			Plan:              "business",
			ConnectedChannels: "Shopee,Tokopedia,TikTok Shop",
			Status:            "active",
		}
		if err := db.Create(&defaultStore).Error; err != nil {
			return err
		}
		log.Println("Seeded default Store: Toko Nusantara Official")
	}

	now := time.Now()

	// 3. Seed Seller Products if empty
	var productCount int64
	db.Model(&models.Product{}).Where("store_id = ?", defaultStore.ID).Count(&productCount)
	if productCount == 0 {
		seedProducts := []models.Product{
			{
				StoreID:        defaultStore.ID,
				SKU:            "KLO-SAGE-01",
				Name:           "Kemeja Linen Oversize Sage",
				Category:       "Atasan Pria & Wanita",
				Warehouse:      "Gudang Sunter, Jakarta Utara",
				Price:          185000,
				Stock:          24,
				SoldCount:      412,
				ShopeeStock:    24,
				TokopediaStock: 24,
				TikTokStock:    24,
				SyncStatus:     "synced",
				Status:         "active",
				AccentTone:     "tangerine",
				LastSyncAt:     now.Add(-2 * time.Minute),
			},
			{
				StoreID:        defaultStore.ID,
				SKU:            "CCS-CREAM-32",
				Name:           "Celana Chino Stretch Cream",
				Category:       "Bawahan Kasual",
				Warehouse:      "Gudang Cikarang, Bekasi",
				Price:          219000,
				Stock:          15,
				SoldCount:      289,
				ShopeeStock:    15,
				TokopediaStock: 15,
				TikTokStock:    15,
				SyncStatus:     "synced",
				Status:         "active",
				AccentTone:     "peach",
				LastSyncAt:     now.Add(-4 * time.Minute),
			},
			{
				StoreID:        defaultStore.ID,
				SKU:            "OKT-BLK-09",
				Name:           "Outer Kimono Tenun Hitam",
				Category:       "Outerwear Etnik",
				Warehouse:      "Gudang Bandung Selatan",
				Price:          275000,
				Stock:          9,
				SoldCount:      198,
				ShopeeStock:    9,
				TokopediaStock: 9,
				TikTokStock:    9,
				SyncStatus:     "synced",
				Status:         "low_stock",
				AccentTone:     "charcoal",
				LastSyncAt:     now.Add(-6 * time.Minute),
			},
			{
				StoreID:        defaultStore.ID,
				SKU:            "KHB-WHT-04",
				Name:           "Kaos Heavyweight Boxy Putih",
				Category:       "Kaos Esensial",
				Warehouse:      "Gudang Sunter, Jakarta Utara",
				Price:          129000,
				Stock:          42,
				SoldCount:      634,
				ShopeeStock:    42,
				TokopediaStock: 42,
				TikTokStock:    42,
				SyncStatus:     "synced",
				Status:         "active",
				AccentTone:     "amber",
				LastSyncAt:     now.Add(-8 * time.Minute),
			},
			{
				StoreID:        defaultStore.ID,
				SKU:            "JCW-OLV-11",
				Name:           "Jaket Coach Waterproof Olive",
				Category:       "Jaket & Windbreaker",
				Warehouse:      "Gudang Surabaya Rungkut",
				Price:          315000,
				Stock:          6,
				SoldCount:      145,
				ShopeeStock:    6,
				TokopediaStock: 8,
				TikTokStock:    6,
				SyncStatus:     "conflict",
				Status:         "low_stock",
				AccentTone:     "forest",
				LastSyncAt:     now.Add(-15 * time.Minute),
			},
		}
		if err := db.Create(&seedProducts).Error; err != nil {
			return err
		}
		log.Println("Seeded 5 multi-channel products into PostgreSQL")
	}

	// 4. Seed Seller Orders if empty
	var orderCount int64
	db.Model(&models.Order{}).Where("store_id = ?", defaultStore.ID).Count(&orderCount)
	if orderCount == 0 {
		seedOrders := []models.Order{
			{
				StoreID:       defaultStore.ID,
				OrderNumber:   "INV-SHP-22739",
				PaymentCode:   "ID: 22739",
				Marketplace:   "Shopee",
				BuyerName:     "Dianne Larasati",
				BuyerInitials: "DL",
				ProductName:   "Kemeja Linen Oversize Sage",
				ProductSKU:    "KLO-SAGE-01",
				PropertySub:   "Shopee Mall • 2 pcs • J&T Express",
				Quantity:      2,
				Amount:        370000,
				Courier:       "J&T Express",
				TrackingResi:  "JP8849201923",
				Status:        "Pending",
				SLADeadline:   "04j 18m tersisa",
				CreatedAt:     now.Add(-25 * time.Minute),
			},
			{
				StoreID:       defaultStore.ID,
				OrderNumber:   "INV-TKP-70668",
				PaymentCode:   "ID: 70668",
				Marketplace:   "Tokopedia",
				BuyerName:     "Jane Kusuma",
				BuyerInitials: "JK",
				ProductName:   "Jaket Coach Waterproof Olive",
				ProductSKU:    "JCW-OLV-11",
				PropertySub:   "Tokopedia PRO • 1 pcs • SiCepat BEST",
				Quantity:      1,
				Amount:        315000,
				Courier:       "SiCepat BEST",
				TrackingResi:  "",
				Status:        "Perlu Resi",
				SLADeadline:   "01j 42m tersisa",
				CreatedAt:     now.Add(-50 * time.Minute),
			},
			{
				StoreID:       defaultStore.ID,
				OrderNumber:   "INV-TTS-97174",
				PaymentCode:   "ID: 97174",
				Marketplace:   "TikTok Shop",
				BuyerName:     "Ralph Ramadhan",
				BuyerInitials: "RR",
				ProductName:   "Celana Chino Stretch Cream",
				ProductSKU:    "CCS-CREAM-32",
				PropertySub:   "TikTok Live • 2 pcs • JNE Reguler",
				Quantity:      2,
				Amount:        438000,
				Courier:       "JNE Reguler",
				TrackingResi:  "JNE009182731",
				Status:        "Shipped",
				SLADeadline:   "Terkirim tepat waktu",
				CreatedAt:     now.Add(-2 * time.Hour),
			},
			{
				StoreID:       defaultStore.ID,
				OrderNumber:   "INV-SHP-43756",
				PaymentCode:   "ID: 43756",
				Marketplace:   "Shopee",
				BuyerName:     "Albert Santoso",
				BuyerInitials: "AS",
				ProductName:   "Outer Kimono Tenun Hitam",
				ProductSKU:    "OKT-BLK-09",
				PropertySub:   "Shopee Star+ • 1 pcs • Anteraja",
				Quantity:      1,
				Amount:        275000,
				Courier:       "Anteraja Reguler",
				TrackingResi:  "100049281723",
				Status:        "Completed",
				SLADeadline:   "Selesai diterima",
				CreatedAt:     now.Add(-5 * time.Hour),
			},
			{
				StoreID:       defaultStore.ID,
				OrderNumber:   "INV-TKP-53178",
				PaymentCode:   "ID: 53178",
				Marketplace:   "Tokopedia",
				BuyerName:     "Ronald Wijaya",
				BuyerInitials: "RW",
				ProductName:   "Kaos Heavyweight Boxy Putih",
				ProductSKU:    "KHB-WHT-04",
				PropertySub:   "Tokopedia Official • 3 pcs • J&T Express",
				Quantity:      3,
				Amount:        387000,
				Courier:       "J&T Express",
				TrackingResi:  "",
				Status:        "Perlu Resi",
				SLADeadline:   "03j 10m tersisa",
				CreatedAt:     now.Add(-7 * time.Hour),
			},
		}
		if err := db.Create(&seedOrders).Error; err != nil {
			return err
		}
		log.Println("Seeded 5 multi-channel orders into PostgreSQL")
	}

	// 5. Seed or Backfill Marketplace Connections
	var mpCount int64
	db.Model(&models.MarketplaceConnection{}).Where("store_id = ?", defaultStore.ID).Count(&mpCount)
	if mpCount == 0 {
		seedConnections := []models.MarketplaceConnection{
			{
				StoreID:             defaultStore.ID,
				Platform:            "Shopee",
				PlatformSlug:        "shopee",
				ShopName:            "Nusantara Official Shopee Mall",
				ShopExternalID:      "SHP-ID-994821",
				Status:              "connected",
				EncryptedToken:      "aes256:shp_live_9f8a7b6c5d4e3f2a1b0c9d8e",
				AutoSync:            true,
				WebhookEnabled:      true,
				SyncIntervalMinutes: 5,
				PriceMarkupPct:      0,
				Rating:              "4.9",
				TokenExpiryDays:     27,
				LastSyncAt:          now.Add(-2 * time.Minute),
			},
			{
				StoreID:             defaultStore.ID,
				Platform:            "Tokopedia",
				PlatformSlug:        "tokopedia",
				ShopName:            "Toko Nusantara Power Merchant PRO",
				ShopExternalID:      "TKP-ID-441209",
				Status:              "connected",
				EncryptedToken:      "aes256:tkp_live_1a2b3c4d5e6f7a8b9c0d1e2f",
				AutoSync:            true,
				WebhookEnabled:      true,
				SyncIntervalMinutes: 5,
				PriceMarkupPct:      0,
				Rating:              "4.9",
				TokenExpiryDays:     21,
				LastSyncAt:          now.Add(-4 * time.Minute),
			},
			{
				StoreID:             defaultStore.ID,
				Platform:            "TikTok Shop",
				PlatformSlug:        "tiktok",
				ShopName:            "Nusantara Wear TikTok Shop",
				ShopExternalID:      "TTS-ID-773104",
				Status:              "connected",
				EncryptedToken:      "aes256:tts_live_5f4e3d2c1b0a9f8e7d6c5b4a",
				AutoSync:            true,
				WebhookEnabled:      true,
				SyncIntervalMinutes: 10,
				PriceMarkupPct:      0,
				Rating:              "4.8",
				TokenExpiryDays:     14,
				LastSyncAt:          now.Add(-6 * time.Minute),
			},
		}
		if err := db.Create(&seedConnections).Error; err != nil {
			return err
		}
		log.Println("Seeded 3 marketplace connections into PostgreSQL")
	} else {
		// Backfill new columns on existing rows if needed
		var existingMPs []models.MarketplaceConnection
		db.Where("store_id = ?", defaultStore.ID).Find(&existingMPs)
		for _, mp := range existingMPs {
			slug := strings.ToLower(strings.Split(mp.Platform, " ")[0])
			extID := mp.ShopExternalID
			if extID == "" {
				extID = strings.ToUpper(slug) + "-ID-88210"
			}
			encToken := mp.EncryptedToken
			if encToken == "" {
				encToken = "aes256:" + slug + "_oauth2_token_active"
			}
			db.Model(&mp).Updates(map[string]interface{}{
				"platform_slug":    slug,
				"shop_external_id": extID,
				"encrypted_token":  encToken,
				"webhook_enabled":  true,
			})
		}
	}

	// 6. Seed SyncLog entries if empty
	var syncLogCount int64
	db.Model(&models.SyncLog{}).Where("store_id = ?", defaultStore.ID).Count(&syncLogCount)
	if syncLogCount == 0 {
		seedLogs := []models.SyncLog{
			{
				StoreID:           defaultStore.ID,
				Platform:          "Shopee",
				ActionType:        "oauth_connect",
				Status:            "success",
				ItemsSynced:       5,
				ConflictsResolved: 0,
				DurationMs:        184,
				Message:           "OAuth 2.0 Shopee Mall terverifikasi (Token terenkripsi AES-256 disimpan)",
				CreatedAt:         now.Add(-45 * time.Minute),
			},
			{
				StoreID:           defaultStore.ID,
				Platform:          "Tokopedia",
				ActionType:        "webhook_stock",
				Status:            "warning",
				ItemsSynced:       5,
				ConflictsResolved: 0,
				DurationMs:        142,
				Message:           "Terdeteksi selisih stok pada SKU JCW-OLV-11 (Master: 6 pcs, Tokopedia: 8 pcs)",
				CreatedAt:         now.Add(-20 * time.Minute),
			},
			{
				StoreID:           defaultStore.ID,
				Platform:          "TikTok Shop",
				ActionType:        "webhook_order",
				Status:            "success",
				ItemsSynced:       1,
				ConflictsResolved: 0,
				DurationMs:        96,
				Message:           "Webhook pesanan INV-TTS-97174 diterima & stok otomatis dikurangi di 3 toko",
				CreatedAt:         now.Add(-10 * time.Minute),
			},
		}
		if err := db.Create(&seedLogs).Error; err != nil {
			return err
		}
		log.Println("Seeded initial marketplace sync_logs into PostgreSQL")
	}

	// 7. Seed Team Members if empty
	var teamCount int64
	db.Model(&models.TeamMember{}).Where("store_id = ?", defaultStore.ID).Count(&teamCount)
	if teamCount == 0 {
		seedMembers := []models.TeamMember{
			{
				StoreID:     defaultStore.ID,
				FullName:    "Budi Pratama",
				Email:       "seller@synccart.id",
				Role:        "Owner Toko",
				Permissions: "lihat_produk,edit_produk,lihat_order,proses_order,lihat_laporan,kelola_marketplace,kelola_tim,manage_settings",
				Status:      "active",
				LastActive:  "Sedang online",
			},
			{
				StoreID:     defaultStore.ID,
				FullName:    "Siti Aminah",
				Email:       "siti.admin@nusantara.id",
				Role:        "Staff Admin Order",
				Permissions: "lihat_produk,lihat_order,proses_order",
				Status:      "active",
				LastActive:  "12 menit lalu",
			},
			{
				StoreID:     defaultStore.ID,
				FullName:    "Rangga Saputra",
				Email:       "rangga.gudang@nusantara.id",
				Role:        "Staff Gudang & Stok",
				Permissions: "lihat_produk,edit_produk,lihat_order",
				Status:      "active",
				LastActive:  "34 menit lalu",
			},
			{
				StoreID:     defaultStore.ID,
				FullName:    "Maya Lestari",
				Email:       "maya.finance@nusantara.id",
				Role:        "Staff Finance & Laporan",
				Permissions: "lihat_order,lihat_laporan",
				Status:      "active",
				LastActive:  "1 jam lalu",
			},
		}
		if err := db.Create(&seedMembers).Error; err != nil {
			return err
		}
		log.Println("Seeded 4 RBAC team members into PostgreSQL")
	}

	return nil
}
