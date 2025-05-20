import { select, Separator } from "@inquirer/prompts";
import { readdir } from "fs/promises";
import { join, resolve } from "path";
import { spawn } from "child_process";
import 'dotenv/config';

type Choice<Value> = {
  value: Value;
  name?: string;
  description?: string;
  short?: string;
  disabled?: boolean | string;
};

if(typeof process.env.FOLDER_ROOT === 'undefined') {
  throw new Error(`
    Please, set an environment variable at the root of project with the name:
    FOLDER_ROOT, followed by the path of your choice.  
  `.trim());
};

let current_folder = process.env.FOLDER_ROOT;

const ENTRY_FOLDER = async (path: string) => {
  try {
    const FOLDERS = await readdir(path);
    const FORMATED_NAMES: Choice<string>[] = [];

    for(let folder of FOLDERS) {
      if(folder.includes('.')) continue; // remove files 

      FORMATED_NAMES.push({
        value: folder,
        name: folder, 
      });
    };

    await generateOptions(FORMATED_NAMES);
  } catch(err) {
    if(err instanceof Error) console.error(err.message)
    else {console.error('Unknown Error')};
  };
};

async function generateOptions(currentOptions: Choice<string>[]) {
  try {
    const defaultOptions  = [
      {value: "Open Folder",name: "Open Folder"},
      {value: "Previous Folder",name: "Previous Folder"},
    ];

    const ANSWER = await select({
      message: 'Browser over folders',
      choices: [
        new Separator("\x1b[32mFolders\x1b[0m"),
        ...currentOptions, 
        new Separator("\x1b[32mActions\x1b[0m"),
        ...defaultOptions,
      ],
    });

    if(ANSWER === "Open Folder") {
      const OPEN_VSCODE_SCRIPT = resolve('./scripts', 'open-vscode.ps1');
      const child = spawn('powershell.exe', [
        '-NoProfile',
        '-ExecutionPolicy', 'Bypass',
        '-File', OPEN_VSCODE_SCRIPT,
        '-Directory', current_folder,
      ], { stdio: 'inherit' });

      child.on('exit', (code) => {
        if (code === 0) {
          console.log('VS Code aberto com sucesso.');
        } else {
          console.error(`Erro ao abrir VS Code. Código de saída: ${code}`);
        };
      });
    } else if(ANSWER === 'Previous Folder') {
      if(ANSWER === process.env.FOLDER_ROOT) {
        console.error('There is just a void over there');
        process.exit(1);
      }
      const CURRENT_FOLDER_LENGTH = current_folder.split('/').length - 1;

      // First, the current folder must be splited, because there is no way  
      // To remove the last folder name and the slash for all scenarios 
      // Using "slice" directly on strings. 

      // So, first, convert the string into an array. This will consume the slashes
      // Then the "slice" will get all elements, less the last item, and join all 
      // With slashes (this adds the slashes again).

      current_folder = current_folder.split('/').slice(0, CURRENT_FOLDER_LENGTH).join("/");
      await ENTRY_FOLDER(current_folder);
    } else {
      current_folder += "/" + ANSWER;
      await ENTRY_FOLDER(join(current_folder));
    };
    return ANSWER;
  } catch {
    console.error('Unknown Error');
  };
};


ENTRY_FOLDER(current_folder);