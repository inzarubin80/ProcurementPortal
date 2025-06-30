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
    {"name": "python: синтаксис", "description": "Основы синтаксиса Python", "programming_language": "python", "color": "#3776AB", "icon": "python", "status": "active"},
    {"name": "python: условные операторы", "description": "Работа с if, elif, else", "programming_language": "python", "color": "#3776AB", "icon": "python", "status": "active"},
    {"name": "python: циклы", "description": "Работа с циклами for и while", "programming_language": "python", "color": "#3776AB", "icon": "python", "status": "active"},
    {"name": "python: функции", "description": "Определение и вызов функций", "programming_language": "python", "color": "#3776AB", "icon": "python", "status": "active"},
    {"name": "python: списки и коллекции", "description": "Работа со списками, словарями, множествами", "programming_language": "python", "color": "#3776AB", "icon": "python", "status": "active"},
    {"name": "python: ооп", "description": "Основы объектно-ориентированного программирования", "programming_language": "python", "color": "#3776AB", "icon": "python", "status": "active"},
    {"name": "python: работа с файлами", "description": "Чтение и запись файлов", "programming_language": "python", "color": "#3776AB", "icon": "python", "status": "active"},
    {"name": "python: исключения", "description": "Обработка ошибок и исключений", "programming_language": "python", "color": "#3776AB", "icon": "python", "status": "active"},
    {"name": "javascript: основы", "description": "Базовые концепции JavaScript", "programming_language": "javascript", "color": "#F7DF1E", "icon": "javascript", "status": "active"},
    {"name": "java: основы", "description": "Основные конструкции языка Java", "programming_language": "java", "color": "#007396", "icon": "java", "status": "active"},
    {"name": "cpp: основы", "description": "Базовые конструкции C++", "programming_language": "cpp", "color": "#00599C", "icon": "cplusplus", "status": "active"},
    {"name": "csharp: основы", "description": "Основные конструкции C#", "programming_language": "csharp", "color": "#239120", "icon": "csharp", "status": "active"},
    {"name": "go: синтаксис", "description": "Основы синтаксиса Go", "programming_language": "go", "color": "#00ADD8", "icon": "go", "status": "active"},
    {"name": "go: условные операторы", "description": "Работа с if, else, switch", "programming_language": "go", "color": "#00ADD8", "icon": "go", "status": "active"},
    {"name": "go: циклы", "description": "Работа с циклами for", "programming_language": "go", "color": "#00ADD8", "icon": "go", "status": "active"},
    {"name": "go: функции", "description": "Определение и вызов функций", "programming_language": "go", "color": "#00ADD8", "icon": "go", "status": "active"},
    {"name": "go: срезы и карты", "description": "Работа со срезами и map", "programming_language": "go", "color": "#00ADD8", "icon": "go", "status": "active"},
    {"name": "go: ооп и интерфейсы", "description": "Интерфейсы и структуры", "programming_language": "go", "color": "#00ADD8", "icon": "go", "status": "active"},
    {"name": "go: работа с файлами", "description": "Чтение и запись файлов", "programming_language": "go", "color": "#00ADD8", "icon": "go", "status": "active"},
    {"name": "go: горутины и каналы", "description": "Параллелизм и каналы", "programming_language": "go", "color": "#00ADD8", "icon": "go", "status": "active"},
    {"name": "rust: основы", "description": "Основные конструкции Rust", "programming_language": "rust", "color": "#000000", "icon": "rust", "status": "active"},
    {"name": "kotlin: основы", "description": "Основные конструкции Kotlin", "programming_language": "kotlin", "color": "#7F52FF", "icon": "kotlin", "status": "active"},
    {"name": "swift: основы", "description": "Основные конструкции Swift", "programming_language": "swift", "color": "#F05138", "icon": "swift", "status": "active"},
    {"name": "typescript: основы", "description": "Основные конструкции TypeScript", "programming_language": "typescript", "color": "#3178C6", "icon": "typescript", "status": "active"},
    {"name": "1c: основы", "description": "Основные конструкции 1С", "programming_language": "1c", "color": "#1C1C1C", "icon": "1c", "status": "active"}
  ],
  "exercises": [
    {
      "title": "python: hello world",
      "description": "Напишите программу, которая выводит 'Hello, World!'",
      "category_name": "python: синтаксис",
      "difficulty": "beginner",
      "programming_language": "python",
      "code_to_remember": "print('Hello, World!')"
    },
    {
      "title": "python: условные операторы",
      "description": "Базовый синтаксис if-elif-else",
      "category_name": "python: условные операторы",
      "difficulty": "beginner",
      "programming_language": "python",
      "code_to_remember": "if x > 10:\n    print('Больше 10')\nelif x > 5:\n    print('Больше 5')\nelse:\n    print('5 или меньше')"
    },
    {
      "title": "python: lambda функции",
      "description": "Создание анонимных функций",
      "category_name": "python: функции",
      "difficulty": "intermediate",
      "programming_language": "python",
      "code_to_remember": "square = lambda x: x * x\nresult = square(5)"
    },
    {
      "title": "javascript: объявление переменных",
      "description": "Различные способы объявления переменных",
      "category_name": "javascript: основы",
      "difficulty": "beginner",
      "programming_language": "javascript",
      "code_to_remember": "var oldWay = 'old';\nlet modernWay = 'modern';\nconst constant = 'constant';"
    },
    {
      "title": "javascript: arrow функции",
      "description": "Синтаксис стрелочных функций",
      "category_name": "javascript: основы",
      "difficulty": "beginner",
      "programming_language": "javascript",
      "code_to_remember": "const add = (a, b) => a + b;\nconst square = x => x * x;"
    },
    {
      "title": "javascript: деструктуризация",
      "description": "Извлечение значений из объектов и массивов",
      "category_name": "javascript: основы",
      "difficulty": "intermediate",
      "programming_language": "javascript",
      "code_to_remember": "const person = { name: 'Alice', age: 30 };\nconst { name, age } = person;\n\nconst numbers = [1, 2, 3];\nconst [first, second] = numbers;"
    },
    {
      "title": "java: основной метод",
      "description": "Точка входа в программу",
      "category_name": "java: основы",
      "difficulty": "beginner",
      "programming_language": "java",
      "code_to_remember": "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, World!\");\n    }\n}"
    },
    {
      "title": "java: интерфейсы",
      "description": "Объявление и реализация интерфейса",
      "category_name": "java: основы",
      "difficulty": "intermediate",
      "programming_language": "java",
      "code_to_remember": "interface Animal {\n    void makeSound();\n}\n\nclass Dog implements Animal {\n    public void makeSound() {\n        System.out.println(\"Woof!\");\n    }\n}"
    },
    {
      "title": "cpp: классы",
      "description": "Создание класса и конструктора",
      "category_name": "cpp: основы",
      "difficulty": "intermediate",
      "programming_language": "cpp",
      "code_to_remember": "class Rectangle {\n    int width, height;\npublic:\n    Rectangle(int w, int h) : width(w), height(h) {}\n    int area() { return width * height; }\n};"
    },
    {
      "title": "cpp: указатели",
      "description": "Работа с указателями",
      "category_name": "cpp: основы",
      "difficulty": "intermediate",
      "programming_language": "cpp",
      "code_to_remember": "int var = 5;\nint* ptr = &var;\n*ptr = 10;"
    },
    {
      "title": "csharp: linq запросы",
      "description": "Базовые операции с linq",
      "category_name": "csharp: основы",
      "difficulty": "intermediate",
      "programming_language": "csharp",
      "code_to_remember": "var numbers = new[] { 1, 2, 3, 4, 5 };\nvar even = numbers.Where(n => n % 2 == 0);\nvar squared = numbers.Select(n => n * n);"
    },
    {
      "title": "csharp: асинхронные методы",
      "description": "Синтаксис async/await",
      "category_name": "csharp: основы",
      "difficulty": "intermediate",
      "programming_language": "csharp",
      "code_to_remember": "async Task<string> GetDataAsync() {\n    using var client = new HttpClient();\n    return await client.GetStringAsync(\"https://api.example.com/data\");\n}"
    },
    {
      "title": "go: hello world",
      "description": "Напишите программу, которая выводит 'Hello, World!'",
      "category_name": "go: синтаксис",
      "difficulty": "beginner",
      "programming_language": "go",
      "code_to_remember": "package main\nimport \"fmt\"\nfunc main() {\n    fmt.Println(\"Hello, World!\")\n}"
    },
    {
      "title": "go: объявление переменных",
      "description": "Объявите переменные разных типов и выведите их значения.",
      "category_name": "go: синтаксис",
      "difficulty": "beginner",
      "programming_language": "go",
      "code_to_remember": "var a int = 5\nb := 10.5\nfmt.Println(a, b)"
    },
    {
      "title": "go: константы и iota",
      "description": "Используйте константы и iota для создания перечисления.",
      "category_name": "go: синтаксис",
      "difficulty": "intermediate",
      "programming_language": "go",
      "code_to_remember": "const (\n    Red = iota\n    Green\n    Blue\n)\nfmt.Println(Red, Green, Blue)"
    },
    {
      "title": "go: if-else",
      "description": "Напишите функцию, которая возвращает 'even' или 'odd' в зависимости от чётности числа.",
      "category_name": "go: условные операторы",
      "difficulty": "beginner",
      "programming_language": "go",
      "code_to_remember": "func evenOdd(n int) string {\n    if n%2 == 0 {\n        return \"even\"\n    } else {\n        return \"odd\"\n    }\n}"
    },
    {
      "title": "go: switch",
      "description": "Используйте switch для определения дня недели по номеру.",
      "category_name": "go: условные операторы",
      "difficulty": "beginner",
      "programming_language": "go",
      "code_to_remember": "switch day {\ncase 1:\n    fmt.Println(\"Monday\")\ncase 2:\n    fmt.Println(\"Tuesday\")\ndefault:\n    fmt.Println(\"Other\")\n}"
    },
    {
      "title": "go: тернарный аналог",
      "description": "В Go нет тернарного оператора, реализуйте его через if.",
      "category_name": "go: условные операторы",
      "difficulty": "intermediate",
      "programming_language": "go",
      "code_to_remember": "a, b := 5, 10\nmax := a\nif b > a {\n    max = b\n}\nfmt.Println(max)"
    },
    {
      "title": "go: for",
      "description": "Выведите числа от 1 до 5 с помощью цикла for.",
      "category_name": "go: циклы",
      "difficulty": "beginner",
      "programming_language": "go",
      "code_to_remember": "for i := 1; i <= 5; i++ {\n    fmt.Println(i)\n}"
    },
    {
      "title": "go: for range",
      "description": "Пройдитесь по срезу с помощью for range.",
      "category_name": "go: циклы",
      "difficulty": "beginner",
      "programming_language": "go",
      "code_to_remember": "nums := []int{1,2,3}\nfor _, v := range nums {\n    fmt.Println(v)\n}"
    },
    {
      "title": "go: бесконечный цикл",
      "description": "Создайте бесконечный цикл и завершите его по условию.",
      "category_name": "go: циклы",
      "difficulty": "intermediate",
      "programming_language": "go",
      "code_to_remember": "i := 0\nfor {\n    if i > 5 { break }\n    fmt.Println(i)\n    i++\n}"
    },
    {
      "title": "go: функция сложения",
      "description": "Реализуйте функцию, возвращающую сумму двух чисел.",
      "category_name": "go: функции",
      "difficulty": "beginner",
      "programming_language": "go",
      "code_to_remember": "func add(a, b int) int {\n    return a + b\n}"
    },
    {
      "title": "go: возврат нескольких значений",
      "description": "Функция, возвращающая частное и остаток от деления.",
      "category_name": "go: функции",
      "difficulty": "intermediate",
      "programming_language": "go",
      "code_to_remember": "func divmod(a, b int) (int, int) {\n    return a/b, a%b\n}"
    },
    {
      "title": "go: анонимная функция",
      "description": "Используйте анонимную функцию для возведения в квадрат.",
      "category_name": "go: функции",
      "difficulty": "intermediate",
      "programming_language": "go",
      "code_to_remember": "square := func(x int) int { return x * x }\nfmt.Println(square(5))"
    },
    {
      "title": "go: срезы",
      "description": "Создайте срез и добавьте в него элементы.",
      "category_name": "go: срезы и карты",
      "difficulty": "beginner",
      "programming_language": "go",
      "code_to_remember": "var s []int\ns = append(s, 1, 2, 3)\nfmt.Println(s)"
    },
    {
      "title": "go: карты",
      "description": "Создайте map и выведите все ключи и значения.",
      "category_name": "go: срезы и карты",
      "difficulty": "beginner",
      "programming_language": "go",
      "code_to_remember": "m := map[string]int{\"a\":1, \"b\":2}\nfor k, v := range m {\n    fmt.Println(k, v)\n}"
    },
    {
      "title": "go: проверка ключа в map",
      "description": "Проверьте, есть ли ключ в map.",
      "category_name": "go: срезы и карты",
      "difficulty": "intermediate",
      "programming_language": "go",
      "code_to_remember": "m := map[string]int{\"a\":1}\nif v, ok := m[\"a\"]; ok {\n    fmt.Println(v)\n}"
    },
    {
      "title": "go: структура",
      "description": "Определите структуру и создайте её экземпляр.",
      "category_name": "go: ооп и интерфейсы",
      "difficulty": "beginner",
      "programming_language": "go",
      "code_to_remember": "type Point struct { X, Y int }\np := Point{1,2}\nfmt.Println(p)"
    },
    {
      "title": "go: интерфейс",
      "description": "Определите интерфейс и реализуйте его.",
      "category_name": "go: ооп и интерфейсы",
      "difficulty": "intermediate",
      "programming_language": "go",
      "code_to_remember": "type Speaker interface { Speak() }\ntype Dog struct{}\nfunc (d Dog) Speak() { fmt.Println(\"Woof!\") }\nvar s Speaker = Dog{}\ns.Speak()"
    },
    {
      "title": "go: встраивание структур",
      "description": "Используйте встраивание структур для расширения функционала.",
      "category_name": "go: ооп и интерфейсы",
      "difficulty": "advanced",
      "programming_language": "go",
      "code_to_remember": "type Animal struct { Name string }\ntype Dog struct { Animal }\nd := Dog{Animal{\"Bobik\"}}\nfmt.Println(d.Name)"
    },
    {
      "title": "go: запись в файл",
      "description": "Запишите строку в файл.",
      "category_name": "go: работа с файлами",
      "difficulty": "intermediate",
      "programming_language": "go",
      "code_to_remember": "import \"os\"\nf, _ := os.Create(\"test.txt\")\nf.WriteString(\"hello\")\nf.Close()"
    },
    {
      "title": "go: чтение файла",
      "description": "Прочитайте содержимое файла и выведите его.",
      "category_name": "go: работа с файлами",
      "difficulty": "intermediate",
      "programming_language": "go",
      "code_to_remember": "import (\"os\"\n\"io/ioutil\")\ndata, _ := ioutil.ReadFile(\"test.txt\")\nfmt.Println(string(data))"
    },
    {
      "title": "go: проверка ошибки при работе с файлом",
      "description": "Обработайте ошибку при открытии файла.",
      "category_name": "go: работа с файлами",
      "difficulty": "intermediate",
      "programming_language": "go",
      "code_to_remember": "f, err := os.Open(\"nofile.txt\")\nif err != nil {\n    fmt.Println(\"ошибка\")\n}"
    },
    {
      "title": "go: горутина",
      "description": "Запустите функцию в отдельной горутине.",
      "category_name": "go: горутины и каналы",
      "difficulty": "intermediate",
      "programming_language": "go",
      "code_to_remember": "go func() { fmt.Println(\"hi\") }()"
    },
    {
      "title": "go: канал",
      "description": "Создайте канал и передайте в него значение.",
      "category_name": "go: горутины и каналы",
      "difficulty": "intermediate",
      "programming_language": "go",
      "code_to_remember": "c := make(chan int)\ngo func() { c <- 1 }()\nfmt.Println(<-c)"
    },
    {
      "title": "go: буферизированный канал",
      "description": "Используйте буферизированный канал для передачи двух значений.",
      "category_name": "go: горутины и каналы",
      "difficulty": "advanced",
      "programming_language": "go",
      "code_to_remember": "c := make(chan int, 2)\nc <- 1\nc <- 2\nfmt.Println(<-c, <-c)"
    },
    {
      "title": "rust: владение",
      "description": "Основные правила владения",
      "category_name": "rust: основы",
      "difficulty": "intermediate",
      "programming_language": "rust",
      "code_to_remember": "let s1 = String::from(\"hello\");\nlet s2 = s1;\nprintln!(\"{}\", s2);"
    },
    {
      "title": "rust: заимствование",
      "description": "Работа с ссылками",
      "category_name": "rust: основы",
      "difficulty": "intermediate",
      "programming_language": "rust",
      "code_to_remember": "fn main() {\n    let s = String::from(\"hello\");\n    let len = calculate_length(&s);\n    println!(\"Длина: {}\", len);\n}\n\nfn calculate_length(s: &String) -> usize {\n    s.len()\n}"
    },
    {
      "title": "kotlin: null safety",
      "description": "Безопасная работа с null",
      "category_name": "kotlin: основы",
      "difficulty": "intermediate",
      "programming_language": "kotlin",
      "code_to_remember": "val name: String? = null\nval length = name?.length ?: 0"
    },
    {
      "title": "kotlin: data классы",
      "description": "Автоматическая генерация методов",
      "category_name": "kotlin: основы",
      "difficulty": "intermediate",
      "programming_language": "kotlin",
      "code_to_remember": "data class Person(val name: String, val age: Int)"
    },
    {
      "title": "swift: опционалы",
      "description": "Работа с optional типами",
      "category_name": "swift: основы",
      "difficulty": "intermediate",
      "programming_language": "swift",
      "code_to_remember": "var optionalString: String? = \"Hello\"\nif let string = optionalString {\n    print(string)\n}\nlet value = optionalString ?? \"default\""
    },
    {
      "title": "swift: замыкания",
      "description": "Синтаксис closure",
      "category_name": "swift: основы",
      "difficulty": "intermediate",
      "programming_language": "swift",
      "code_to_remember": "let names = [\"Chris\", \"Alex\", \"Ewa\"]\nlet sorted = names.sorted { $0 > $1 }"
    },
    {
      "title": "typescript: типы",
      "description": "Базовые типы данных",
      "category_name": "typescript: основы",
      "difficulty": "beginner",
      "programming_language": "typescript",
      "code_to_remember": "let isDone: boolean = false;\nlet decimal: number = 6;\nlet name: string = \"Alice\";\nlet list: number[] = [1, 2, 3];"
    },
    {
      "title": "typescript: generics",
      "description": "Обобщенные типы",
      "category_name": "typescript: основы",
      "difficulty": "advanced",
      "programming_language": "typescript",
      "code_to_remember": "function identity<T>(arg: T): T {\n    return arg;\n}\n\nlet output = identity<string>(\"myString\");"
    },
    {
      "title": "1c: запросы",
      "description": "Базовый синтаксис запросов",
      "category_name": "1c: основы",
      "difficulty": "intermediate",
      "programming_language": "1c",
      "code_to_remember": "Запрос = Новый Запрос;\nЗапрос.Текст = \"ВЫБРАТЬ | Справочник.Номенклатура.Наименование\";\nРезультат = Запрос.Выполнить();\nВыборка = Результат.Выбрать();\nПока Выборка.Следующий() Цикл\n    Сообщить(Выборка.Наименование);\nКонецЦикла;"
    },
    {
      "title": "1c: обработка ошибок",
      "description": "Конструкция Попытка-Исключение",
      "category_name": "1c: основы",
      "difficulty": "intermediate",
      "programming_language": "1c",
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
