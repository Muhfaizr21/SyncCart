package auth

import (
	"errors"
	"strings"
	"time"

	"github.com/Muhfaizr21/SyncCart/backend/config"
	"github.com/Muhfaizr21/SyncCart/backend/models"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type Claims struct {
	UserID uint   `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

type Service struct {
	repo      *Repository
	jwtSecret string
}

func NewService(repo *Repository, jwtSecret string) *Service {
	return &Service{
		repo:      repo,
		jwtSecret: jwtSecret,
	}
}

type RegisterInput struct {
	FullName  string `json:"full_name"`
	Email     string `json:"email"`
	Password  string `json:"password"`
	StoreName string `json:"store_name"`
	Channels  string `json:"channels"`
}

type LoginInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResult struct {
	Token string       `json:"token"`
	User  *models.User `json:"user"`
}

func (s *Service) Register(input RegisterInput) (*AuthResult, error) {
	fullName := strings.TrimSpace(input.FullName)
	email := strings.ToLower(strings.TrimSpace(input.Email))
	password := input.Password

	if fullName == "" || email == "" || !strings.Contains(email, "@") {
		return nil, errors.New("nama lengkap dan alamat email valid wajib diisi")
	}
	if len(password) < 6 {
		return nil, errors.New("password minimal terdiri dari 6 karakter")
	}

	existing, err := s.repo.FindByEmail(email)
	if err == nil && existing != nil {
		return nil, errors.New("email sudah terdaftar, silakan masuk menggunakan akun tersebut")
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	hashBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	newUser := &models.User{
		FullName:     fullName,
		Email:        email,
		PasswordHash: string(hashBytes),
		Role:         config.RoleSeller,
		Status:       "active",
	}

	createdUser, err := s.repo.CreateSellerWithStore(newUser, input.StoreName, input.Channels)
	if err != nil {
		return nil, err
	}

	token, err := s.generateJWT(createdUser)
	if err != nil {
		return nil, err
	}

	return &AuthResult{
		Token: token,
		User:  createdUser,
	}, nil
}

func (s *Service) Login(input LoginInput) (*AuthResult, error) {
	email := strings.ToLower(strings.TrimSpace(input.Email))
	if email == "" || input.Password == "" {
		return nil, errors.New("email dan password wajib diisi")
	}

	user, err := s.repo.FindByEmail(email)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("email atau password tidak sesuai")
		}
		return nil, err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password)); err != nil {
		return nil, errors.New("email atau password tidak sesuai")
	}

	if user.Status != "active" {
		return nil, errors.New("akun ini sedang dinonaktifkan")
	}

	token, err := s.generateJWT(user)
	if err != nil {
		return nil, err
	}

	return &AuthResult{
		Token: token,
		User:  user,
	}, nil
}

func (s *Service) GetByID(userID uint) (*models.User, error) {
	return s.repo.FindByID(userID)
}

func (s *Service) ListAllUsers() ([]models.User, error) {
	return s.repo.ListAllUsers()
}

func (s *Service) ValidateJWT(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (any, error) {
		return []byte(s.jwtSecret), nil
	})
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, errors.New("token tidak valid")
	}

	return claims, nil
}

func (s *Service) generateJWT(user *models.User) (string, error) {
	now := time.Now()
	claims := Claims{
		UserID: user.ID,
		Email:  user.Email,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   user.Email,
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(30 * 24 * time.Hour)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.jwtSecret))
}

