export type Block =
  | { type: 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'code'; label: string; code: string }
  | { type: 'tip' | 'note' | 'warning'; title: string; body: string }
  | { type: 'table'; cols: string[]; rows: string[][] }
  | { type: 'list'; items: string[] };

export interface Chapter {
  id: number;
  emoji: string;
  title: string;
  intro: string;
  blocks: Block[];
  initialCode: string;
}

export const chapters: Chapter[] = [
  {
    id: 1,
    emoji: '👋',
    title: 'Привіт, Python!',
    intro: 'Ласкаво просимо! Дізнаємось, що таке Python, і напишемо твою першу програму.',
    blocks: [
      { type: 'h3', text: 'Що таке програмування?' },
      { type: 'p', text: '**Програма** — це список інструкцій для комп\'ютера. Комп\'ютер виконує їх точно, одну за одною. Програмування — це написання таких інструкцій.' },
      { type: 'h3', text: 'Що таке Python?' },
      { type: 'p', text: 'Python — одна з найпопулярніших мов програмування у світі. Вчені, розробники ігор, веб-інженери та навіть NASA використовують Python!' },
      { type: 'tip', title: '🐍 Чому Python?', body: 'Python читається майже як звичайна мова. Замість складних символів ти пишеш зрозумілі інструкції — ідеально для початківців.' },
      { type: 'h3', text: 'print() — твоя перша команда' },
      { type: 'p', text: '`print()` наказує Python відобразити текст на екрані. Помісти текст у дужки в лапках.' },
      { type: 'code', label: 'python · приклад', code: 'print("Привіт, Світе!")\nprint("Я вчусь Python!")' },
      { type: 'note', title: '📝 Лапки', body: 'Текст у print() завжди має бути в лапках — одинарні \'привіт\' або подвійні "привіт" — обидва варіанти працюють.' },
      { type: 'h3', text: 'Спробуй сам!' },
      { type: 'p', text: 'Редагуй код у майданчику і натисни **Запустити**. Спробуй додати більше рядків `print()`!' },
    ],
    initialCode: `print("Привіт, Світе!")\nprint("Мене звати Python!")\nprint("Я вчусь програмувати! 🚀")`,
  },
  {
    id: 2,
    emoji: '📦',
    title: 'Змінні',
    intro: 'Змінні — це підписані коробки для зберігання інформації. Можна класти в них дані, читати та змінювати їх.',
    blocks: [
      { type: 'h3', text: 'Що таке змінна?' },
      { type: 'p', text: 'Уяви коробку з підписом «вік» і числом 13 всередині. Коли тобі потрібен вік — просто заглянь у коробку «вік». Це і є змінна.' },
      { type: 'code', label: 'python · створення змінних', code: 'name = "Олексій"\nage  = 13\ncity = "Київ"\n\nprint(name)\nprint(age)' },
      { type: 'h3', text: 'Правила іменування' },
      { type: 'list', items: ['Лише літери, цифри та підкреслення', 'Не може починатись з цифри', 'Без пробілів — використовуй my_name, а не my name', 'Регістр важливий: Name ≠ name'] },
      { type: 'warning', title: '⚠️ Недійсні імена', body: '2cool, my name, class (зарезервоване слово) — усі вони викликають помилки.' },
      { type: 'h3', text: 'Поширені типи' },
      { type: 'table', cols: ['Тип', 'Приклад', 'Зберігає'], rows: [['str', 'name = "Аліса"', 'Текст'], ['int', 'age = 13', 'Цілі числа'], ['float', 'height = 1.65', 'Десяткові числа'], ['bool', 'happy = True', 'True або False']] },
      { type: 'tip', title: '💡 Змінні можуть змінюватись!', body: 'Саме тому вони називаються змінними. score = 0 а потім score = 10 — абсолютно нормально.' },
    ],
    initialCode: `# Заповни своїми даними!\nname    = "Твоє Ім'я"\nage     = 13\ngrade   = 7\nsubject = "Математика"\n\nprint("Ім'я:", name)\nprint("Вік:", age)\nprint("Клас:", grade)\nprint("Улюблений предмет:", subject)\n\n# Змінні можуть змінюватись\nscore = 0\nprint("Рахунок:", score)\nscore = 100\nprint("Новий рахунок:", score)`,
  },
  {
    id: 3,
    emoji: '🔢',
    title: 'Числа та математика',
    intro: 'Python — це потужний калькулятор. Давай дослідимо арифметику і всі математичні можливості.',
    blocks: [
      { type: 'h3', text: 'Два види чисел' },
      { type: 'p', text: '**int** — цілі числа: `5`, `-3`, `1000`\n**float** — десяткові числа: `3.14`, `-0.5`, `2.0`' },
      { type: 'h3', text: 'Оператори' },
      { type: 'table', cols: ['Символ', 'Операція', 'Приклад', 'Результат'], rows: [['+', 'Додавання', '10 + 3', '13'], ['-', 'Віднімання', '10 - 3', '7'], ['*', 'Множення', '10 * 3', '30'], ['/', 'Ділення', '10 / 3', '3.333…'], ['//', 'Цілочисельне ділення', '10 // 3', '3'], ['%', 'Остача від ділення', '10 % 3', '1'], ['**', 'Степінь', '2 ** 8', '256']] },
      { type: 'tip', title: '💡 % (модуло)', body: '10 % 3 = 1 — залишок після ділення. Чудово підходить для перевірки парності: n % 2 == 0.' },
      { type: 'h3', text: 'Порядок операцій' },
      { type: 'p', text: 'Python дотримується тих самих правил, що й у шкільній математиці: дужки, степені, множення/ділення, додавання/віднімання.' },
      { type: 'code', label: 'python · порядок важливий', code: 'print(2 + 3 * 4)    # 14, а не 20\nprint((2 + 3) * 4)  # 20\nprint(2 ** 10)      # 1024' },
    ],
    initialCode: `a = 25\nb = 7\n\nprint("Додавання:", a + b)\nprint("Віднімання:", a - b)\nprint("Множення:", a * b)\nprint("Ділення:", a / b)\nprint("Остача:", a % b)\nprint("a у квадраті:", a ** 2)\n\n# Вбудовані функції\nprint("макс:", max(a, b))\nprint("мін:", min(a, b))\nprint("округлення 3.7:", round(3.7))\n\nn = 42\nprint(n, "є парним:", n % 2 == 0)`,
  },
  {
    id: 4,
    emoji: '💬',
    title: 'Рядки (текст)',
    intro: 'Рядки — спосіб зберігати текст у Python. Їх можна створювати, об\'єднувати та перетворювати.',
    blocks: [
      { type: 'h3', text: 'Створення рядків' },
      { type: 'p', text: 'Будь-який текст у лапках є рядком. Можна використовувати одинарні або подвійні лапки.' },
      { type: 'code', label: 'python · рядки', code: 'greeting = "Привіт!"\nname     = \'Python\'\nfun      = "Я люблю кодити 🎉"' },
      { type: 'h3', text: 'f-рядки (сучасний спосіб)' },
      { type: 'p', text: 'Постав `f` перед лапками і вставляй змінні у `{фігурні дужки}`.' },
      { type: 'code', label: 'python · f-рядки', code: 'name = "Олексій"\nage  = 13\nprint(f"Мене звати {name}, мені {age} років.")' },
      { type: 'h3', text: 'Корисні методи рядків' },
      { type: 'table', cols: ['Метод', 'Що робить', 'Приклад → Результат'], rows: [['len(s)', 'Кількість символів', 'len("привіт") → 6'], ['s.upper()', 'ВСІ ВЕЛИКІ', '"hi".upper() → "HI"'], ['s.lower()', 'всі малі', '"HI".lower() → "hi"'], ['s.replace(a,b)', 'Замінює текст', '"кіт".replace("кіт","пес") → "пес"'], ['s.count(x)', 'Рахує входження', '"банан".count("а") → 3']] },
      { type: 'tip', title: '💡 Повторення рядка', body: '"га" * 3 → "гагага"' },
    ],
    initialCode: `name = "Учень Python"\nsentence = "я люблю програмувати"\n\nprint("Довжина:", len(name))\nprint("Великі літери:", name.upper())\nprint("Малі літери:", sentence.lower())\nprint("Заміна:", sentence.replace("програмувати", "Python"))\n\nage = 13\nprint(f"Привіт! Я {name}, мені {age} років.")\n\nprint("Python! " * 3)`,
  },
  {
    id: 5,
    emoji: '⌨️',
    title: 'Введення даних',
    intro: 'Програми стають інтерактивними, коли можуть питати. input() зупиняє програму і чекає, доки користувач щось введе.',
    blocks: [
      { type: 'h3', text: 'Функція input()' },
      { type: 'p', text: '`input()` показує підказку і чекає, доки користувач введе текст. Вона завжди повертає **рядок**.' },
      { type: 'code', label: 'python · базове введення', code: 'name = input("Як тебе звати? ")\nprint(f"Привіт, {name}!")' },
      { type: 'warning', title: '⚠️ Завжди рядок!', body: 'Навіть якщо користувач введе 13, input() поверне "13" (текст). Для математики потрібно перетворити тип.' },
      { type: 'h3', text: 'Перетворення типів' },
      { type: 'code', label: 'python · перетворення типів', code: 'age = int(input("Твій вік: "))\nprint(f"Наступного року тобі буде {age + 1}!")\n\nprice = float(input("Ціна: "))\nnumber = str(42)  # число → текст' },
      { type: 'note', title: '📝 У майданчику', body: 'Коли твій код викликає input(), з\'явиться спливаюче вікно. Введи відповідь і натисни OK.' },
    ],
    initialCode: `# Програма вітання\nname = input("Як тебе звати? ")\nprint(f"Привіт, {name}! Радий познайомитись! 👋")\n\n# Простий калькулятор\nnum1 = float(input("Введи перше число: "))\nnum2 = float(input("Введи друге число: "))\nprint(f"{num1} + {num2} = {num1 + num2}")\nprint(f"{num1} * {num2} = {num1 * num2}")`,
  },
  {
    id: 6,
    emoji: '🤔',
    title: 'Прийняття рішень',
    intro: 'Програми мають обирати, що робити — так само як і ти щодня! if/elif/else дозволяє Python приймати рішення на основі умов.',
    blocks: [
      { type: 'h3', text: 'Оператори порівняння' },
      { type: 'table', cols: ['Оператор', 'Значення', 'Приклад', 'Результат'], rows: [['==', 'Рівне', '5 == 5', 'True'], ['!=', 'Не рівне', '5 != 3', 'True'], ['>', 'Більше', '7 > 3', 'True'], ['<', 'Менше', '7 < 3', 'False'], ['>=', 'Більше або рівне', '5 >= 5', 'True'], ['<=', 'Менше або рівне', '4 <= 3', 'False']] },
      { type: 'h3', text: 'if / elif / else' },
      { type: 'code', label: 'python · умовний оператор', code: 'temp = 28\n\nif temp > 30:\n    print("Спекотно! 🌞")\nelif temp > 20:\n    print("Тепло 😊")\nelif temp > 10:\n    print("Прохолодно 🧥")\nelse:\n    print("Холодно ❄️")' },
      { type: 'warning', title: '⚠️ Відступи обов\'язкові!', body: 'Код усередині блоку if має бути з відступом (4 пробіли). Python використовує відступи замість дужок.' },
      { type: 'h3', text: 'and / or / not' },
      { type: 'code', label: 'python · комбінування умов', code: 'age = 15\nhas_ticket = True\n\nif age >= 13 and has_ticket:\n    print("Ласкаво просимо! 🎭")\nelse:\n    print("Вибачте.")' },
    ],
    initialCode: `# Калькулятор оцінок — змінюй бал!\nscore = 85\n\nif score >= 90:\n    grade, comment = "A", "Відмінно! 🌟"\nelif score >= 80:\n    grade, comment = "B", "Чудова робота! 👍"\nelif score >= 70:\n    grade, comment = "C", "Добре! 😊"\nelif score >= 60:\n    grade, comment = "D", "Продовжуй старатись! 💪"\nelse:\n    grade, comment = "F", "Не здавайся! 🔄"\n\nprint(f"Бал:      {score}")\nprint(f"Оцінка:   {grade}")\nprint(f"Коментар: {comment}")`,
  },
  {
    id: 7,
    emoji: '🔁',
    title: 'Цикли',
    intro: 'Цикли дозволяють Python повторювати дії багато разів без копіювання коду. Це одна з найпотужніших ідей у програмуванні!',
    blocks: [
      { type: 'h3', text: 'Цикл for' },
      { type: 'p', text: 'Повторює код задану кількість разів за допомогою `range()`.' },
      { type: 'code', label: 'python · цикл for', code: 'for i in range(5):\n    print(f"Крок {i}")\n# range(5)      → 0 1 2 3 4\n# range(1, 6)   → 1 2 3 4 5\n# range(0,10,2) → 0 2 4 6 8' },
      { type: 'h3', text: 'Цикл while' },
      { type: 'p', text: 'Продовжує повторювати, доки умова є True.' },
      { type: 'code', label: 'python · цикл while', code: 'count = 1\nwhile count <= 5:\n    print(count)\n    count += 1  # те саме що count = count + 1' },
      { type: 'warning', title: '⚠️ Нескінченні цикли', body: 'Якщо умова while ніколи не стає False, цикл крутиться вічно. Завжди змінюй щось усередині циклу!' },
      { type: 'h3', text: 'break і continue' },
      { type: 'code', label: 'python · break & continue', code: 'for i in range(10):\n    if i == 3: continue  # пропускаємо 3\n    if i == 7: break     # зупиняємось на 7\n    print(i)' },
    ],
    initialCode: `# Таблиця множення\nprint("=== Таблиця множення на 7 ===")\nfor i in range(1, 11):\n    print(f"7 x {i:2d} = {7 * i}")\n\nprint()\n\n# Сума від 1 до 100\ntotal = 0\nfor n in range(1, 101):\n    total += n\nprint(f"Сума від 1 до 100 = {total}")\n\n# Зворотній відлік\nprint("\\nВідлік:")\ncount = 5\nwhile count > 0:\n    print(count, end=" ")\n    count -= 1\nprint("🚀 Старт!")`,
  },
  {
    id: 8,
    emoji: '📋',
    title: 'Списки',
    intro: 'Списки зберігають багато елементів в одній змінній — як список покупок або плейлист.',
    blocks: [
      { type: 'h3', text: 'Створення списку' },
      { type: 'code', label: 'python · списки', code: 'fruits  = ["яблуко", "банан", "вишня"]\nnumbers = [1, 2, 3, 4, 5]\nmixed   = ["Аліса", 13, True]  # різні типи — нормально' },
      { type: 'h3', text: 'Індексація — Python рахує з 0!' },
      { type: 'code', label: 'python · індексація', code: 'fruits = ["яблуко", "банан", "вишня"]\n#         [0]       [1]     [2]\nprint(fruits[0])   # яблуко\nprint(fruits[-1])  # вишня (останній)' },
      { type: 'h3', text: 'Методи списків' },
      { type: 'table', cols: ['Метод', 'Що робить'], rows: [['list.append(x)', 'Додає в кінець'], ['list.remove(x)', 'Видаляє перший збіг'], ['list.pop()', 'Видаляє і повертає останній'], ['list.sort()', 'Сортує список'], ['list.reverse()', 'Перевертає порядок'], ['len(list)', 'Кількість елементів'], ['x in list', 'True, якщо x існує']] },
    ],
    initialCode: `tasks = ["Зробити домашнє завдання", "Погодувати кота", "Вчити Python"]\n\nprint("Мої завдання:")\nfor i, task in enumerate(tasks, 1):\n    print(f"  {i}. {task}")\n\ntasks.append("Почитати книгу")\ntasks.remove("Погодувати кота")\n\nprint(f"\\nОновлено ({len(tasks)} завдань):")\nfor task in tasks:\n    print(f"  - {task}")\n\nscores = [85, 92, 67, 78, 95, 88]\nscores.sort()\nprint(f"\\nВідсортовані: {scores}")\nprint(f"Найкращий: {scores[-1]}, Середній: {sum(scores)/len(scores):.1f}")`,
  },
  {
    id: 9,
    emoji: '🛠️',
    title: 'Функції',
    intro: 'Функції дозволяють назвати блок коду і використовувати його повторно. Пишеш один раз — викликаєш багато разів.',
    blocks: [
      { type: 'h3', text: 'Визначення функції' },
      { type: 'code', label: 'python · def', code: 'def say_hello():\n    print("Привіт!")\n    print("Як справи?")\n\nsay_hello()  # виклик\nsay_hello()  # ще один виклик!' },
      { type: 'h3', text: 'Параметри (вхідні дані)' },
      { type: 'code', label: 'python · параметри', code: 'def greet(name, age):\n    print(f"Привіт {name}! Тобі {age} років.")\n\ngreet("Аліса", 13)\ngreet("Боб",   14)' },
      { type: 'h3', text: 'Значення, що повертаються' },
      { type: 'code', label: 'python · return', code: 'def add(a, b):\n    return a + b\n\nresult = add(10, 5)\nprint(result)     # 15\nprint(add(3, 7))  # 10' },
      { type: 'tip', title: '💡 Параметри за замовчуванням', body: 'def greet(name, msg="Привіт"): — якщо не передати msg, буде використано "Привіт".' },
    ],
    initialCode: `def greet(name, greeting="Привіт"):\n    print(f"{greeting}, {name}! 👋")\n\ndef area(length, width):\n    return length * width\n\ndef is_even(n):\n    return n % 2 == 0\n\ndef biggest(a, b, c):\n    if a >= b and a >= c:\n        return a\n    elif b >= c:\n        return b\n    return c\n\ngreet("Олексій")\ngreet("Марія", "Вітаю")\n\nprint(f"Площа 5x8 = {area(5, 8)} кв. м")\n\nprint("\\nПарні числа до 10:")\nfor n in range(1, 11):\n    if is_even(n):\n        print(n, end=" ")\nprint()\n\nprint(f"\\nНайбільше з 7, 12, 9 = {biggest(7, 12, 9)}")`,
  },
  {
    id: 10,
    emoji: '🎮',
    title: 'Проєкт: Вгадай число',
    intro: 'Час зібрати все разом! Побудуємо гру, використовуючи всі концепції, які ти вивчив.',
    blocks: [
      { type: 'h3', text: 'Що ми будуємо' },
      { type: 'p', text: 'Комп\'ютер загадує секретне число від 1 до 100. Ти його вгадуєш. Після кожної спроби він каже «замало», «забагато» або «правильно!». У тебе є 7 спроб.' },
      { type: 'h3', text: 'Нова ідея: import' },
      { type: 'p', text: 'Python постачається з **модулями** — колекціями додаткових інструментів. Нам потрібен модуль `random` для вибору випадкового числа.' },
      { type: 'code', label: 'python · модуль random', code: 'import random\n\nsecret = random.randint(1, 100)\nprint(secret)  # різне кожного разу!' },
      { type: 'tip', title: '🏆 Ідеї для покращення!', body: '• Відстежуй рахунок по кількох раундах\n• Підказки "дуже близько!" або "далеко!"\n• Дай гравцю обрати складність' },
      { type: 'note', title: '🎓 Ти закінчив книгу!', body: 'Тепер ти знаєш основи: змінні, рядки, числа, введення, умови, цикли, списки та функції. Продовжуй будувати — так навчаються справжні програмісти!' },
    ],
    initialCode: `import random\n\nsecret = random.randint(1, 100)\nattempts = 0\nmax_tries = 7\n\nprint("🎮 Гра: Вгадай число")\nprint(f"Я загадав число від 1 до 100.")\nprint(f"У тебе є {max_tries} спроб. Удачі!\\n")\n\nwhile attempts < max_tries:\n    guess = int(input(f"Спроба #{attempts + 1}: "))\n    attempts += 1\n    remaining = max_tries - attempts\n\n    if guess < secret:\n        print(f"📉 Замало! ({remaining} спроб залишилось)")\n    elif guess > secret:\n        print(f"📈 Забагато! ({remaining} спроб залишилось)")\n    else:\n        print(f"\\n🎉 Правильно! Ти вгадав за {attempts} спроб(и)!")\n        break\nelse:\n    print(f"\\n😢 Загадане число було {secret}.")`,
  },
];
