package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	AppName        string
	AppEnv         string
	AppPort        string
	FrontendOrigin string
	DBHost         string
	DBPort         string
	DBUser         string
	DBPassword     string
	DBName         string
	DBSSLMode      string
	RedisAddr      string
	JWTSecret      string
	AESKey         string
}

func Load() *Config {
	// Missing .env is expected in production where variables come from the host environment.
	_ = godotenv.Load()

	return &Config{
		AppName:        getEnv("APP_NAME", "SyncCart-API"),
		AppEnv:         getEnv("APP_ENV", "development"),
		AppPort:        getEnv("APP_PORT", "8080"),
		FrontendOrigin: getEnv("FRONTEND_ORIGIN", "http://localhost:5173"),
		DBHost:         getEnv("DB_HOST", "localhost"),
		DBPort:         getEnv("DB_PORT", "5432"),
		DBUser:         getEnv("DB_USER", "muhfaiizr"),
		DBPassword:     getEnv("DB_PASSWORD", "admin"),
		DBName:         getEnv("DB_NAME", "synccart"),
		DBSSLMode:      getEnv("DB_SSLMODE", "disable"),
		RedisAddr:      getEnv("REDIS_ADDR", "localhost:6379"),
		JWTSecret:      getEnv("JWT_SECRET", "dev-jwt-secret-change-in-production"),
		AESKey:         getEnv("AES_ENCRYPTION_KEY", "0123456789abcdef0123456789abcdef"),
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists && value != "" {
		return value
	}
	return fallback
}
