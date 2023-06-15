import fs from 'fs'

const LINE_DELIMITER = '\n';
const VALUE_DELIMITER = ',';

export async function readFile(path, firstParam) {
    const content = fs.readFileSync(path).toLocaleString();
    const parameters = content.split(LINE_DELIMITER, 1)[0].split(VALUE_DELIMITER);
    parameters[0] = firstParam;

    return content.split(LINE_DELIMITER).slice(1).map((line) => {
        const result = Object();
        line.split(VALUE_DELIMITER).forEach((value, index) => {
        result[parameters[index]] = value;
        });
        return result;
    });
}
