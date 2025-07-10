package defenitions

type contextKey string

const (
	AuthorizationCode                    = "authorization_code"
	UserIDKey                 contextKey = "user_id"
	DisplayName                          = "display_name"
	DefaultEmail                         = "default_email"
	SessionAuthenticationName            = "authentication"
	Token                                = "token"
	ProviderKey                          = "provider_Key"
	Page                                 = "page"
	PageSize                             = "page_size"
	IsAdminKey                contextKey = "isAdmin"
)
