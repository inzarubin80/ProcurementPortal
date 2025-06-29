package http

import (
	"encoding/json"
	"inzarubin80/MemCode/internal/app/uhttp"
	"inzarubin80/MemCode/internal/model"
	"net/http"
)

type GetLanguagesHandler struct {
	name string
}

type LanguageResponse struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

func NewGetLanguagesHandler(name string) *GetLanguagesHandler {
	return &GetLanguagesHandler{
		name: name,
	}
}

func (h *GetLanguagesHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	supportedLanguages := model.GetSupportedLanguages()

	// Преобразуем строки в объекты с name и value
	languages := make([]LanguageResponse, len(supportedLanguages))
	for i, lang := range supportedLanguages {
		languages[i] = LanguageResponse{
			Name:  getLanguageDisplayName(lang),
			Value: string(lang),
		}
	}

	jsonData, err := json.Marshal(languages)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	uhttp.SendSuccessfulResponse(w, jsonData)
}

// getLanguageDisplayName возвращает отображаемое имя для языка программирования
func getLanguageDisplayName(lang model.ProgrammingLanguage) string {
	switch lang {
	case model.LanguagePython:
		return "Python"
	case model.LanguageJavaScript:
		return "JavaScript"
	case model.LanguageJava:
		return "Java"
	case model.LanguageCpp:
		return "C++"
	case model.LanguageCSharp:
		return "C#"
	case model.LanguageGo:
		return "Go"
	case model.LanguageRust:
		return "Rust"
	case model.LanguageKotlin:
		return "Kotlin"
	case model.LanguageSwift:
		return "Swift"
	case model.LanguageTypeScript:
		return "TypeScript"
	case model.Language1C:
		return "1С"
	default:
		return string(lang)
	}
}
