const fs = require("fs");
const path = require("path");

const folderPath = "./location/school"; // путь к папке
const outputFile = "./imports.txt"; // файл, куда запишем

const files = fs.readdirSync(folderPath);

const lines = files
	.filter((file) => file.endsWith(".png"))
	.map((file) => {
		const name = path.parse(file).name.replace(/[^a-zA-Z0-9]/g, "_"); // заменяем символы на _

		return `import ${name} from "/images/location/school/${file}";`;
	});

fs.writeFileSync(outputFile, lines.join("\n"));

console.log("Готово ✅");

