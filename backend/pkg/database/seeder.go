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
		&models.SubscriptionInvoice{},
		&models.PlatformCoupon{},
		&models.PlatformSetting{},
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
			OwnerID:                 seller.ID,
			StoreName:               "Toko Nusantara Official",
			Plan:                    "business",
			ConnectedChannels:       "Shopee,Tokopedia,TikTok Shop",
			PlatformFeePercent:      6.5,
			OperationalCogsPercent:  42.0,
			TaxPercent:              0.5,
			ReportScheduleEmail:     "seller@synccart.id",
			ReportScheduleFrequency: "weekly",
			Status:                  "active",
		}
		if err := db.Create(&defaultStore).Error; err != nil {
			return err
		}
		log.Println("Seeded default Store: Toko Nusantara Official")
	} else if defaultStore.PlatformFeePercent == 0 && defaultStore.OperationalCogsPercent == 0 {
		db.Model(&defaultStore).Updates(map[string]interface{}{
			"platform_fee_percent":      6.5,
			"operational_cogs_percent":  42.0,
			"tax_percent":               0.5,
			"report_schedule_email":     "seller@synccart.id",
			"report_schedule_frequency": "weekly",
		})
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
	} else {
		var existingOrders []models.Order
		db.Where("store_id = ?", defaultStore.ID).Order("id ASC").Find(&existingOrders)
		methods := []string{"QRIS", "Virtual Account BCA", "COD (Bayar di Tempat)", "ShopeePay / GoPay", "Kartu Kredit / PayLater"}
		for idx, ord := range existingOrders {
			if ord.PaymentMethod == "" || (ord.PaymentMethod == "QRIS" && idx > 0) {
				db.Model(&ord).Update("payment_method", methods[idx%len(methods)])
			}
		}
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
				StoreID:          defaultStore.ID,
				FullName:         "Budi Pratama",
				Email:            "seller@synccart.id",
				Phone:            "0811-9988-7701",
				Department:       "Manajemen & Integrasi",
				Role:             "Owner Toko",
				Permissions:      "lihat_produk,edit_produk,lihat_order,proses_order,lihat_laporan,kelola_marketplace,kelola_tim,manage_settings",
				AssignedChannels: "Shopee,Tokopedia,TikTok Shop",
				TwoFactorEnabled: true,
				SessionDevice:    "MacBook Pro M3 • Safari 18 (Jakarta)",
				SessionIP:        "103.144.22.10",
				InviteExpiresAt:  "Akun Utama Owner",
				ActionsCount:     142,
				Status:           "active",
				LastActive:       "Sedang online",
			},
			{
				StoreID:          defaultStore.ID,
				FullName:         "Siti Aminah",
				Email:            "siti.admin@nusantara.id",
				Phone:            "0812-8421-9012",
				Department:       "Operasional & Order",
				Role:             "Staff Admin Order",
				Permissions:      "lihat_produk,lihat_order,proses_order",
				AssignedChannels: "Shopee,Tokopedia,TikTok Shop",
				TwoFactorEnabled: true,
				SessionDevice:    "Windows 11 • Chrome 130 (Jakarta)",
				SessionIP:        "114.122.89.41",
				InviteExpiresAt:  "Terverifikasi",
				ActionsCount:     89,
				Status:           "active",
				LastActive:       "12 menit lalu",
			},
			{
				StoreID:          defaultStore.ID,
				FullName:         "Rangga Saputra",
				Email:            "rangga.gudang@nusantara.id",
				Phone:            "0813-7712-4490",
				Department:       "Gudang & Logistik",
				Role:             "Staff Gudang & Stok",
				Permissions:      "lihat_produk,edit_produk,lihat_order",
				AssignedChannels: "Shopee,Tokopedia",
				TwoFactorEnabled: true,
				SessionDevice:    "Android Scanner • Chrome Mobile (Sunter)",
				SessionIP:        "182.253.44.19",
				InviteExpiresAt:  "Terverifikasi",
				ActionsCount:     64,
				Status:           "active",
				LastActive:       "34 menit lalu",
			},
			{
				StoreID:          defaultStore.ID,
				FullName:         "Maya Lestari",
				Email:            "maya.finance@nusantara.id",
				Phone:            "0815-6601-2381",
				Department:       "Keuangan & Akuntansi",
				Role:             "Staff Finance & Laporan",
				Permissions:      "lihat_order,lihat_laporan",
				AssignedChannels: "Shopee,Tokopedia,TikTok Shop",
				TwoFactorEnabled: false,
				SessionDevice:    "MacBook Air M2 • Edge 129 (Bandung)",
				SessionIP:        "36.72.118.90",
				InviteExpiresAt:  "Terverifikasi",
				ActionsCount:     37,
				Status:           "active",
				LastActive:       "1 jam lalu",
			},
		}
		if err := db.Create(&seedMembers).Error; err != nil {
			return err
		}
		log.Println("Seeded 4 RBAC team members into PostgreSQL")
	} else {
		var existingMembers []models.TeamMember
		db.Where("store_id = ?", defaultStore.ID).Order("id ASC").Find(&existingMembers)
		depts := []string{"Manajemen & Integrasi", "Operasional & Order", "Gudang & Logistik", "Keuangan & Akuntansi"}
		phones := []string{"0811-9988-7701", "0812-8421-9012", "0813-7712-4490", "0815-6601-2381"}
		devices := []string{
			"MacBook Pro M3 • Safari 18 (Jakarta)",
			"Windows 11 • Chrome 130 (Jakarta)",
			"Android Scanner • Chrome Mobile (Sunter)",
			"MacBook Air M2 • Edge 129 (Bandung)",
		}
		ips := []string{"103.144.22.10", "114.122.89.41", "182.253.44.19", "36.72.118.90"}
		actions := []int{142, 89, 64, 37}
		for idx, m := range existingMembers {
			if m.Phone == "" || m.Phone == "-" {
				db.Model(&m).Updates(map[string]interface{}{
					"phone":          phones[idx%len(phones)],
					"department":     depts[idx%len(depts)],
					"session_device": devices[idx%len(devices)],
					"session_ip":     ips[idx%len(ips)],
					"actions_count":  actions[idx%len(actions)],
				})
			}
			if m.Role == "Owner Toko" && !strings.Contains(m.Permissions, "kelola_stok") {
				db.Model(&m).Update("permissions", "lihat_produk,edit_produk,hapus_produk,kelola_stok,lihat_order,proses_order,buat_order_manual,batal_refund_order,kelola_marketplace,konfigurasi_markup_sync,simulasi_audit_webhook,lihat_laporan,atur_parameter_laba,ekspor_jadwal_laporan,kelola_tim,kontrol_sesi_2fa,transfer_kepemilikan,manage_settings,kelola_langganan,unduh_invoice_billing")
			} else if m.Role == "Staff Admin Order" && !strings.Contains(m.Permissions, "buat_order_manual") {
				db.Model(&m).Update("permissions", "lihat_produk,lihat_order,proses_order,buat_order_manual,batal_refund_order")
			} else if m.Role == "Staff Gudang & Stok" && !strings.Contains(m.Permissions, "kelola_stok") {
				db.Model(&m).Update("permissions", "lihat_produk,edit_produk,kelola_stok,lihat_order,proses_order")
			} else if m.Role == "Staff Finance & Laporan" && !strings.Contains(m.Permissions, "ekspor_jadwal_laporan") {
				db.Model(&m).Update("permissions", "lihat_order,lihat_laporan,atur_parameter_laba,ekspor_jadwal_laporan,unduh_invoice_billing")
			}
		}
	}

	// 8. Seed Subscription Invoices if empty
	var invoiceCount int64
	db.Model(&models.SubscriptionInvoice{}).Where("store_id = ?", defaultStore.ID).Count(&invoiceCount)
	if invoiceCount == 0 {
		seedInvoices := []models.SubscriptionInvoice{
			{
				StoreID:        defaultStore.ID,
				InvoiceNumber:  "INV-SUB-202610-003",
				PlanName:       "Business",
				BillingCycle:   "monthly",
				BaseAmount:     299000,
				AddonsAmount:   0,
				DiscountAmount: 0,
				TaxAmount:      32890,
				TotalAmount:    331890,
				PaymentGateway: "Midtrans • BCA Virtual Account",
				AddonsSummary:  "Tanpa Add-on Ekstra",
				PeriodStart:    "28 Okt 2026",
				PeriodEnd:      "28 Nov 2026",
				Status:         "Paid",
				CreatedAt:      now.Add(-2 * time.Hour),
			},
			{
				StoreID:        defaultStore.ID,
				InvoiceNumber:  "INV-SUB-202609-002",
				PlanName:       "Business",
				BillingCycle:   "monthly",
				BaseAmount:     299000,
				AddonsAmount:   25000,
				DiscountAmount: 0,
				TaxAmount:      35640,
				TotalAmount:    359640,
				PaymentGateway: "Midtrans • BCA Virtual Account",
				AddonsSummary:  "+1.000 Kuota SKU & Cloud WebP Storage",
				PeriodStart:    "28 Sep 2026",
				PeriodEnd:      "28 Okt 2026",
				Status:         "Paid",
				CreatedAt:      now.Add(-30 * 24 * time.Hour),
			},
			{
				StoreID:        defaultStore.ID,
				InvoiceNumber:  "INV-SUB-202608-001",
				PlanName:       "Starter",
				BillingCycle:   "monthly",
				BaseAmount:     99000,
				AddonsAmount:   0,
				DiscountAmount: 0,
				TaxAmount:      10890,
				TotalAmount:    109890,
				PaymentGateway: "Xendit • QRIS Korporat",
				AddonsSummary:  "Tanpa Add-on Ekstra",
				PeriodStart:    "28 Agu 2026",
				PeriodEnd:      "28 Sep 2026",
				Status:         "Paid",
				CreatedAt:      now.Add(-60 * 24 * time.Hour),
			},
		}
		if err := db.Create(&seedInvoices).Error; err != nil {
			return err
		}
		log.Println("Seeded 3 subscription invoices into PostgreSQL")
	}

	// 9. Seed Additional Multi-Tenant Sellers & Stores for SuperAdmin Ecosystem
	var totalStoresCount int64
	db.Model(&models.Store{}).Count(&totalStoresCount)
	if totalStoresCount < 4 {
		extraSellers := []struct {
			FullName  string
			Email     string
			StoreName string
			StoreSlug string
			Category  string
			City      string
			Plan      string
			Cycle     string
			Status    string
			SKU       string
			ProdName  string
			Price     int64
			Stock     int
			Sold      int
			OrderNo   string
			Buyer     string
			Initials  string
			Channel   string
			Amount    int64
			OrdStatus string
		}{
			{
				FullName:  "Muhammad Sadad",
				Email:     "sadad@erigo.id",
				StoreName: "Erigo Apparel Flagship",
				StoreSlug: "erigo-apparel-flagship",
				Category:  "Fashion & Apparel Omnichannel",
				City:      "Tangerang Selatan, Banten",
				Plan:      "enterprise",
				Cycle:     "annual",
				Status:    "active",
				SKU:       "ERG-HD-BLK-01",
				ProdName:  "Erigo Hoodie Fleece Oversize Black",
				Price:     249000,
				Stock:     85,
				Sold:      1240,
				OrderNo:   "INV-SHP-88412",
				Buyer:     "Esther Howard",
				Initials:  "EH",
				Channel:   "Shopee",
				Amount:    747000,
				OrdStatus: "Completed",
			},
			{
				FullName:  "Salman Subakat",
				Email:     "ops@kahfgrooming.id",
				StoreName: "Kahf Grooming Official",
				StoreSlug: "kahf-grooming-official",
				Category:  "Beauty, Skincare & Personal Care",
				City:      "Jakarta Selatan, DKI Jakarta",
				Plan:      "business",
				Cycle:     "monthly",
				Status:    "active",
				SKU:       "KHF-FW-100ML",
				ProdName:  "Kahf Oil & Acne Care Face Wash Triple Pack",
				Price:     115000,
				Stock:     64,
				Sold:      890,
				OrderNo:   "INV-TTS-66310",
				Buyer:     "James Moore",
				Initials:  "JM",
				Channel:   "TikTok Shop",
				Amount:    345000,
				OrdStatus: "Shipped",
			},
			{
				FullName:  "Adhitya Caesarico",
				Email:     "founder@aerostreet.id",
				StoreName: "AeroStreet Footwear ID",
				StoreSlug: "aerostreet-footwear-id",
				Category:  "Olahraga, Hobi & Gaya Hidup",
				City:      "Klaten, Jawa Tengah",
				Plan:      "starter",
				Cycle:     "monthly",
				Status:    "active",
				SKU:       "AERO-SNK-42",
				ProdName:  "AeroStreet Hoops Low Classic White Green",
				Price:     169000,
				Stock:     18,
				Sold:      520,
				OrderNo:   "INV-TKP-91204",
				Buyer:     "Christopher Harris",
				Initials:  "CH",
				Channel:   "Tokopedia",
				Amount:    507000,
				OrdStatus: "Perlu Resi",
			},
		}

		for idx, item := range extraSellers {
			var u models.User
			if err := db.Where("email = ?", item.Email).First(&u).Error; errors.Is(err, gorm.ErrRecordNotFound) {
				u = models.User{
					FullName:     item.FullName,
					Email:        item.Email,
					PasswordHash: passwordHash,
					Role:         config.RoleSeller,
					Status:       "active",
				}
				db.Create(&u)
			}

			var st models.Store
			if err := db.Where("owner_id = ?", u.ID).First(&st).Error; errors.Is(err, gorm.ErrRecordNotFound) {
				st = models.Store{
					OwnerID:           u.ID,
					StoreName:         item.StoreName,
					StoreSlug:         item.StoreSlug,
					BusinessCategory:  item.Category,
					WarehouseCity:     item.City,
					Plan:              item.Plan,
					BillingCycle:      item.Cycle,
					ConnectedChannels: "Shopee,Tokopedia,TikTok Shop",
					Status:            item.Status,
				}
				db.Create(&st)

				prod := models.Product{
					StoreID:        st.ID,
					SKU:            item.SKU,
					Name:           item.ProdName,
					Category:       item.Category,
					Warehouse:      item.City,
					Price:          item.Price,
					Stock:          item.Stock,
					SoldCount:      item.Sold,
					ShopeeStock:    item.Stock,
					TokopediaStock: item.Stock,
					TikTokStock:    item.Stock,
					SyncStatus:     "synced",
					Status:         "active",
					LastSyncAt:     now.Add(-time.Duration(idx+3) * time.Minute),
				}
				db.Create(&prod)

				ord := models.Order{
					StoreID:       st.ID,
					OrderNumber:   item.OrderNo,
					PaymentCode:   "ID: " + item.OrderNo[len(item.OrderNo)-5:],
					Marketplace:   item.Channel,
					BuyerName:     item.Buyer,
					BuyerInitials:   item.Initials,
					BuyerPhone:      "0812-8800-441" + string(rune('1'+idx)),
					ShippingAddress: "Jl. Sudirman Kav. 21, " + item.City,
					ProductName:     item.ProdName,
					ProductSKU:    item.SKU,
					PropertySub:   item.Channel + " Official • 3 pcs • J&T Express",
					Quantity:      3,
					Amount:        item.Amount,
					Courier:       "J&T Express",
					PaymentMethod: "QRIS",
					TrackingResi:  "JP9920182" + string(rune('1'+idx)),
					Status:        item.OrdStatus,
					SLADeadline:   "Tepat Waktu",
					CreatedAt:     now.Add(-time.Duration(idx+1) * time.Hour),
				}
				db.Create(&ord)

				baseAmt := int64(299000)
				planLabel := "Business"
				if item.Plan == "enterprise" {
					baseAmt = 799000
					planLabel = "Enterprise"
				} else if item.Plan == "starter" {
					baseAmt = 99000
					planLabel = "Starter"
				}
				taxAmt := (baseAmt * 11) / 100
				inv := models.SubscriptionInvoice{
					StoreID:        st.ID,
					InvoiceNumber:  "INV-ADM-202610-10" + string(rune('1'+idx)),
					PlanName:       planLabel,
					BillingCycle:   item.Cycle,
					BaseAmount:     baseAmt,
					TaxAmount:      taxAmt,
					TotalAmount:    baseAmt + taxAmt,
					PaymentGateway: "Midtrans • BCA Virtual Account",
					AddonsSummary:  "Paket Multi-Toko Aktif",
					PeriodStart:    "01 Okt 2026",
					PeriodEnd:      "01 Nov 2026",
					Status:         "Paid",
					CreatedAt:      now.Add(-time.Duration(idx+2) * 24 * time.Hour),
				}
				db.Create(&inv)
			}
		}
	}

	// 10. Seed Platform Coupons if empty
	var couponCount int64
	db.Model(&models.PlatformCoupon{}).Count(&couponCount)
	if couponCount == 0 {
		seedCoupons := []models.PlatformCoupon{
			{
				Code:            "SYNCCART10",
				Description:     "Potongan 10% langganan bulanan & tahunan untuk semua seller",
				DiscountPercent: 10,
				MaxUses:         500,
				UsedCount:       42,
				ApplicablePlans: "starter,business,enterprise",
				ExpiresAt:       "31 Des 2026",
				Status:          "active",
			},
			{
				Code:            "STARTUP20",
				Description:     "Diskon 20% akselerasi brand lokal omnichannel",
				DiscountPercent: 20,
				MaxUses:         200,
				UsedCount:       19,
				ApplicablePlans: "business,enterprise",
				ExpiresAt:       "31 Des 2026",
				Status:          "active",
			},
			{
				Code:            "UMKMJAYA",
				Description:     "Diskon 10% khusus migrasi seller Starter",
				DiscountPercent: 10,
				MaxUses:         1000,
				UsedCount:       128,
				ApplicablePlans: "starter",
				ExpiresAt:       "30 Nov 2026",
				Status:          "active",
			},
		}
		db.Create(&seedCoupons)
	}

	// 11. Seed Singleton Platform Setting if empty
	var settingCount int64
	db.Model(&models.PlatformSetting{}).Count(&settingCount)
	if settingCount == 0 {
		db.Create(&models.PlatformSetting{
			PlatformName:             "SyncCart Enterprise Cloud",
			SupportEmail:             "ops@synccart.id",
			SupportPhone:             "+62 21 5088 9900",
			OfficeAddress:            "Menara Sudirman Lt. 18, SCBD Jakarta Selatan",
			ShopeePartnerID:          "SHP-PARTNER-2009841",
			ShopeePartnerKeyMasked:   "shp_partner_live_••••_9921",
			ShopeeRateLimitPerMin:    1200,
			TokopediaAppID:           "TKP-FS-884120",
			TokopediaSecretMasked:    "tkp_fs_secret_••••_4410",
			TokopediaRateLimitPerMin: 1000,
			TikTokAppKey:             "TTS-OPEN-661920",
			TikTokSecretMasked:       "tts_open_live_••••_7732",
			TikTokRateLimitPerMin:    900,
			CommissionStarterPct:     1.5,
			CommissionBusinessPct:    1.0,
			CommissionEnterprisePct:  0.5,
			MaintenanceMode:          false,
			AutoSuspendUnpaidDays:    3,
		})
	}

	return nil
}
