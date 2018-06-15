import * as os from 'os';
import * as path from 'path';

export const osDirPath: string = os.homedir();
export const defaultWorkspace = path.resolve(osDirPath, './Documents/JR_Workspace');