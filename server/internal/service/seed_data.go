package service

import (
	"context"
	"encoding/json"
	"fmt"
	"inzarubin80/MemCode/internal/model"
)

// Встроенные начальные данные (fallback если файл не найден)
var embeddedSeedData = `{
  "categories": [
    {
      "name": "Основы Python",
      "description": "Базовые упражнения по Python для начинающих",
      "programming_language": "Python",
      "color": "#3776AB",
      "icon": "python",
      "status": "active"
    },
    {
      "name": "JavaScript Основы",
      "description": "Базовые концепции JavaScript",
      "programming_language": "JavaScript",
      "color": "#F7DF1E",
      "icon": "javascript",
      "status": "active"
    },
    {
      "name": "Java Основы",
      "description": "Основные конструкции языка Java",
      "programming_language": "Java",
      "color": "#007396",
      "icon": "java",
      "status": "active"
    },
    {
      "name": "C++ Основы",
      "description": "Базовые конструкции C++",
      "programming_language": "C++",
      "color": "#00599C",
      "icon": "cplusplus",
      "status": "active"
    },
    {
      "name": "C# Основы",
      "description": "Основные конструкции C#",
      "programming_language": "C#",
      "color": "#239120",
      "icon": "csharp",
      "status": "active"
    },
    {
      "name": "Go Основы",
      "description": "Основные конструкции Go",
      "programming_language": "Go",
      "color": "#00ADD8",
      "icon": "go",
      "status": "active"
    },
    {
      "name": "Rust Основы",
      "description": "Основные конструкции Rust",
      "programming_language": "Rust",
      "color": "#000000",
      "icon": "rust",
      "status": "active"
    },
    {
      "name": "Kotlin Основы",
      "description": "Основные конструкции Kotlin",
      "programming_language": "Kotlin",
      "color": "#7F52FF",
      "icon": "kotlin",
      "status": "active"
    },
    {
      "name": "Swift Основы",
      "description": "Основные конструкции Swift",
      "programming_language": "Swift",
      "color": "#F05138",
      "icon": "swift",
      "status": "active"
    },
    {
      "name": "TypeScript Основы",
      "description": "Основные конструкции TypeScript",
      "programming_language": "TypeScript",
      "color": "#3178C6",
      "icon": "typescript",
      "status": "active"
    },
    {
      "name": "1C Основы",
      "description": "Основные конструкции 1С",
      "programming_language": "1C",
      "color": "#1C1C1C",
      "icon": "1c",
      "status": "active"
    }
  ],
  "exercises": [
    {
      "title": "Python: Hello World",
      "description": "Напишите программу, которая выводит 'Hello, World!'",
      "category_name": "Основы Python",
      "difficulty": "beginner",
      "programming_language": "Python",
      "code_to_remember": "print('Hello, World!')"
    },
    {
      "title": "Python: Условные операторы",
      "description": "Базовый синтаксис if-elif-else",
      "category_name": "Основы Python",
      "difficulty": "beginner",
      "programming_language": "Python",
      "code_to_remember": "if x > 10:\n    print('Больше 10')\nelif x > 5:\n    print('Больше 5')\nelse:\n    print('5 или меньше')"
    },
    {
      "title": "Python: Lambda функции",
      "description": "Создание анонимных функций",
      "category_name": "Основы Python",
      "difficulty": "intermediate",
      "programming_language": "Python",
      "code_to_remember": "square = lambda x: x * x\nresult = square(5)"
    },
    {
      "title": "JavaScript: Объявление переменных",
      "description": "Различные способы объявления переменных",
      "category_name": "JavaScript Основы",
      "difficulty": "beginner",
      "programming_language": "JavaScript",
      "code_to_remember": "var oldWay = 'old';\nlet modernWay = 'modern';\nconst constant = 'constant';"
    },
    {
      "title": "JavaScript: Arrow функции",
      "description": "Синтаксис стрелочных функций",
      "category_name": "JavaScript Основы",
      "difficulty": "beginner",
      "programming_language": "JavaScript",
      "code_to_remember": "const add = (a, b) => a + b;\nconst square = x => x * x;"
    },
    {
      "title": "JavaScript: Деструктуризация",
      "description": "Извлечение значений из объектов и массивов",
      "category_name": "JavaScript Основы",
      "difficulty": "intermediate",
      "programming_language": "JavaScript",
      "code_to_remember": "const person = { name: 'Alice', age: 30 };\nconst { name, age } = person;\n\nconst numbers = [1, 2, 3];\nconst [first, second] = numbers;"
    },
    {
      "title": "Java: Основной метод",
      "description": "Точка входа в программу",
      "category_name": "Java Основы",
      "difficulty": "beginner",
      "programming_language": "Java",
      "code_to_remember": "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, World!\");\n    }\n}"
    },
    {
      "title": "Java: Интерфейсы",
      "description": "Объявление и реализация интерфейса",
      "category_name": "Java Основы",
      "difficulty": "intermediate",
      "programming_language": "Java",
      "code_to_remember": "interface Animal {\n    void makeSound();\n}\n\nclass Dog implements Animal {\n    public void makeSound() {\n        System.out.println(\"Woof!\");\n    }\n}"
    },
    {
      "title": "C++: Классы",
      "description": "Создание класса и конструктора",
      "category_name": "C++ Основы",
      "difficulty": "intermediate",
      "programming_language": "C++",
      "code_to_remember": "class Rectangle {\n    int width, height;\npublic:\n    Rectangle(int w, int h) : width(w), height(h) {}\n    int area() { return width * height; }\n};"
    },
    {
      "title": "C++: Указатели",
      "description": "Работа с указателями",
      "category_name": "C++ Основы",
      "difficulty": "intermediate",
      "programming_language": "C++",
      "code_to_remember": "int var = 5;\nint* ptr = &var;\n*ptr = 10;"
    },
    {
      "title": "C#: LINQ запросы",
      "description": "Базовые операции с LINQ",
      "category_name": "C# Основы",
      "difficulty": "intermediate",
      "programming_language": "C#",
      "code_to_remember": "var numbers = new[] { 1, 2, 3, 4, 5 };\nvar even = numbers.Where(n => n % 2 == 0);\nvar squared = numbers.Select(n => n * n);"
    },
    {
      "title": "C#: Асинхронные методы",
      "description": "Синтаксис async/await",
      "category_name": "C# Основы",
      "difficulty": "intermediate",
      "programming_language": "C#",
      "code_to_remember": "async Task<string> GetDataAsync() {\n    using var client = new HttpClient();\n    return await client.GetStringAsync(\"https://api.example.com/data\");\n}"
    },
    {
      "title": "Go: Горутины",
      "description": "Параллельное выполнение",
      "category_name": "Go Основы",
      "difficulty": "intermediate",
      "programming_language": "Go",
      "code_to_remember": "func say(s string) {\n    for i := 0; i < 3; i++ {\n        time.Sleep(100 * time.Millisecond)\n        fmt.Println(s)\n    }\n}\n\ngo say(\"goroutine\")\nsay(\"main\")"
    },
    {
      "title": "Go: Каналы",
      "description": "Коммуникация между горутинами",
      "category_name": "Go Основы",
      "difficulty": "intermediate",
      "programming_language": "Go",
      "code_to_remember": "c := make(chan int)\ngo func() { c <- 1 }()\nvalue := <-c"
    },
    {
      "title": "Rust: Владение",
      "description": "Основные правила владения",
      "category_name": "Rust Основы",
      "difficulty": "intermediate",
      "programming_language": "Rust",
      "code_to_remember": "let s1 = String::from(\"hello\");\nlet s2 = s1;\nprintln!(\"{}\", s2);"
    },
    {
      "title": "Rust: Заимствование",
      "description": "Работа с ссылками",
      "category_name": "Rust Основы",
      "difficulty": "intermediate",
      "programming_language": "Rust",
      "code_to_remember": "fn main() {\n    let s = String::from(\"hello\");\n    let len = calculate_length(&s);\n    println!(\"Длина: {}\", len);\n}\n\nfn calculate_length(s: &String) -> usize {\n    s.len()\n}"
    },
    {
      "title": "Kotlin: Null Safety",
      "description": "Безопасная работа с null",
      "category_name": "Kotlin Основы",
      "difficulty": "intermediate",
      "programming_language": "Kotlin",
      "code_to_remember": "val name: String? = null\nval length = name?.length ?: 0"
    },
    {
      "title": "Kotlin: Data классы",
      "description": "Автоматическая генерация методов",
      "category_name": "Kotlin Основы",
      "difficulty": "intermediate",
      "programming_language": "Kotlin",
      "code_to_remember": "data class Person(val name: String, val age: Int)"
    },
    {
      "title": "Swift: Опционалы",
      "description": "Работа с optional типами",
      "category_name": "Swift Основы",
      "difficulty": "intermediate",
      "programming_language": "Swift",
      "code_to_remember": "var optionalString: String? = \"Hello\"\nif let string = optionalString {\n    print(string)\n}\nlet value = optionalString ?? \"default\""
    },
    {
      "title": "Swift: Замыкания",
      "description": "Синтаксис closure",
      "category_name": "Swift Основы",
      "difficulty": "intermediate",
      "programming_language": "Swift",
      "code_to_remember": "let names = [\"Chris\", \"Alex\", \"Ewa\"]\nlet sorted = names.sorted { $0 > $1 }"
    },
    {
      "title": "TypeScript: Типы",
      "description": "Базовые типы данных",
      "category_name": "TypeScript Основы",
      "difficulty": "beginner",
      "programming_language": "TypeScript",
      "code_to_remember": "let isDone: boolean = false;\nlet decimal: number = 6;\nlet name: string = \"Alice\";\nlet list: number[] = [1, 2, 3];"
    },
    {
      "title": "TypeScript: Generics",
      "description": "Обобщенные типы",
      "category_name": "TypeScript Основы",
      "difficulty": "advanced",
      "programming_language": "TypeScript",
      "code_to_remember": "function identity<T>(arg: T): T {\n    return arg;\n}\n\nlet output = identity<string>(\"myString\");"
    },
    {
      "title": "1C: Запросы",
      "description": "Базовый синтаксис запросов",
      "category_name": "1C Основы",
      "difficulty": "intermediate",
      "programming_language": "1C",
      "code_to_remember": "Запрос = Новый Запрос;\nЗапрос.Текст = \"ВЫБРАТЬ | Справочник.Номенклатура.Наименование\";\nРезультат = Запрос.Выполнить();\nВыборка = Результат.Выбрать();\nПока Выборка.Следующий() Цикл\n    Сообщить(Выборка.Наименование);\nКонецЦикла;"
    },
    {
      "title": "1C: Обработка ошибок",
      "description": "Конструкция Попытка-Исключение",
      "category_name": "1C Основы",
      "difficulty": "intermediate",
      "programming_language": "1C",
      "code_to_remember": "Попытка\n    // Код, который может вызвать ошибку\nИсключение\n    Сообщить(ОписаниеОшибки());\nКонецПопытки;"
    }
  ]
}`

// SeedData структура для начальных данных
type SeedData struct {
	Categories []SeedCategory `json:"categories"`
	Exercises  []SeedExercise `json:"exercises"`
}

// SeedCategory структура категории из JSON
type SeedCategory struct {
	Name                string `json:"name"`
	Description         string `json:"description"`
	ProgrammingLanguage string `json:"programming_language"`
	Color               string `json:"color"`
	Icon                string `json:"icon"`
	Status              string `json:"status"`
}

// SeedExercise структура упражнения из JSON
type SeedExercise struct {
	Title               string `json:"title"`
	Description         string `json:"description"`
	CategoryName        string `json:"category_name"`
	Difficulty          string `json:"difficulty"`
	ProgrammingLanguage string `json:"programming_language"`
	CodeToRemember      string `json:"code_to_remember"`
}

// LoadSeedData загружает начальные данные из JSON файла
func LoadSeedData() (*SeedData, error) {


		fmt.Printf("[INFO] File not found, using embedded seed data\n")
		data := []byte(embeddedSeedData)
		filePath := "embedded"
	

	// Парсим JSON
	var seedData SeedData
	if err := json.Unmarshal(data, &seedData); err != nil {
		return nil, fmt.Errorf("failed to parse seed data JSON from %s: %w", filePath, err)
	}

	fmt.Printf("[INFO] Successfully loaded seed data from: %s\n", filePath)
	return &seedData, nil
}

// SeedUserData создает начальные категории и упражнения для нового пользователя
func (s *PokerService) SeedUserData(ctx context.Context, userID model.UserID) error {
	// Загружаем начальные данные
	seedData, err := LoadSeedData()
	if err != nil {
		return err
	}

	// Создаем категории и сохраняем их ID для связи с упражнениями
	categoryMap := make(map[string]string) // category_name -> category_id

	for _, seedCategory := range seedData.Categories {
		// Создаем категорию
		category := model.Category{
			UserID:              userID,
			Name:                seedCategory.Name,
			Description:         seedCategory.Description,
			ProgrammingLanguage: model.ProgrammingLanguage(seedCategory.ProgrammingLanguage),
			Color:               seedCategory.Color,
			Icon:                seedCategory.Icon,
			Status:              seedCategory.Status,
			IsActive:            true,
		}

		// Сохраняем категорию в БД
		createdCategory, err := s.repository.CreateCategory(ctx, &category)
		if err != nil {
			return err
		}

		// Сохраняем ID категории для связи с упражнениями
		categoryMap[seedCategory.Name] = createdCategory.ID
	}

	// Создаем упражнения
	for _, seedExercise := range seedData.Exercises {
		// Получаем ID категории по имени
		categoryID, exists := categoryMap[seedExercise.CategoryName]
		if !exists {
			// Если категория не найдена, пропускаем упражнение
			continue
		}

		// Создаем упражнение
		exercise := model.Exercise{
			UserID:              userID,
			Title:               seedExercise.Title,
			Description:         seedExercise.Description,
			CategoryID:          categoryID,
			Difficulty:          model.Difficulty(seedExercise.Difficulty),
			ProgrammingLanguage: model.ProgrammingLanguage(seedExercise.ProgrammingLanguage),
			CodeToRemember:      seedExercise.CodeToRemember,
			IsActive:            true,
		}

		// Сохраняем упражнение в БД
		_, err := s.repository.CreateExercise(ctx, &exercise)
		if err != nil {
			return err
		}
	}

	return nil
}
