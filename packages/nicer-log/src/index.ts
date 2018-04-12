import * as crc32 from 'easy-crc32';
import * as TinyColor from 'tinycolor2';

interface ColorPalette {
  backgroundColor: string;
  textColor: string;
}

interface GroupColorMap {
  [key: string]: ColorPalette;
}

const PALETTE: ColorPalette[] = [
  // Navy
  {
    backgroundColor: '#001F3F',
    textColor: '#80bfff'
  },
  // Blue
  {
    backgroundColor: '#0074D9',
    textColor: '#b3dbff'
  },
  // Aqua
  {
    backgroundColor: '#7FDBFF',
    textColor: '#004966'
  },
  // Teal
  {
    backgroundColor: '#39CCCC',
    textColor: 'black'
  },
  // Olive
  {
    backgroundColor: '#3D9970',
    textColor: '#163728'
  },
  // Green
  {
    backgroundColor: '#2ECC40',
    textColor: '#0e3e14'
  },
  // Lime
  {
    backgroundColor: '#01FF70',
    textColor: '#00662c'
  },
  // Yellow
  {
    backgroundColor: '#FFDC00',
    textColor: '#665800'
  },
  // Orange
  {
    backgroundColor: '#FF851B',
    textColor: '#663000'
  },
  // Red
  {
    backgroundColor: '#FF4136',
    textColor: '#800600'
  },
  // Maroon
  {
    backgroundColor: '#85144b',
    textColor: '#eb7ab1'
  },
  // Fuchsia
  {
    backgroundColor: '#F012BE',
    textColor: '#65064f'
  },
  // Purple
  {
    backgroundColor: '#B10DC9',
    textColor: '#efa9f9'
  },
  // Black
  {
    backgroundColor: '#111',
    textColor: '#ddd'
  },
  // Gray
  {
    backgroundColor: '#AAA',
    textColor: '#000'
  },
  // Silver
  {
    backgroundColor: '#DDD',
    textColor: '#000'
  }
];

const PALETTE_LENGTH = PALETTE.length;
const groupColorMap: GroupColorMap = {};

let _logEverUsed = false;
let _whitelist: string[];
let _blacklist: string[];

export interface NicerLog {
  /**
   * @description
   * Outputs a message to the Web Console.
   */
  (message?: any, ...optionalParams: any[]): void;
  async(label: string, promise: Promise<any>, ...additionalInfo: any[]): void;
}

function logWithoutSource(...params: any[]) {
  setTimeout(console.log.bind(console, ...params));
}

function formatGroupName(groupName: string) {
  return `%c[%c${groupName}%c]`;
}

function getGroupLabelStyle(currentColor: ColorPalette) {
  const bracketStyle = `color: ${currentColor.backgroundColor}; background: ${
    currentColor.backgroundColor
  }; padding: 2px 0;`;
  const textStyle = `color: ${currentColor.textColor}; background: ${currentColor.backgroundColor}; padding: 2px 0;`;
  return [bracketStyle, textStyle, bracketStyle];
}

function generateCurrentColor(groupName: string): ColorPalette {
  if (!groupColorMap[groupName]) {
    const chosenColor = PALETTE[crc32.calculate(groupName) % PALETTE_LENGTH];
    groupColorMap[groupName] = chosenColor;
  }
  return groupColorMap[groupName];
}

function getAsyncStatusLabelStyle(colorString: string) {
  return `border: 1px solid ${colorString}; color: ${colorString}; padding: 1px 4px; font-weight: bold; margin-left: 2px;`;
}

function getAsyncDescriptionLabelStyle(currentColor: ColorPalette) {
  const backgroundColor = TinyColor(currentColor.backgroundColor);
  return `color: ${backgroundColor.isDark() ? currentColor.backgroundColor : currentColor.textColor}; margin: 0 4px;`;
}

export function setNicerLogBlacklist(blacklist: string[]) {
  if (_logEverUsed) {
    throw new Error('NicerLog: Cannot set blacklist any more if any log instance has been created.');
  }
  if (typeof _blacklist !== 'undefined') {
    throw new Error('NicerLog: setNicerLogBlacklist cannot be called more than once.');
  }
  _blacklist = blacklist;
}

export function setNicerLogWhitelist(whitelist: string[]) {
  if (_logEverUsed) {
    throw new Error('NicerLog: Cannot set whitelist any more if any log instance has been created.');
  }
  if (typeof _whitelist !== 'undefined') {
    throw new Error('NicerLog: setNicerLogWhitelist cannot be called more than once.');
  }
  _whitelist = whitelist;
}

export default function nicerLog(groupName: string): NicerLog {
  // If any log instance has been created, mark the flag to true
  // and do not allow to set black and white list any more
  _logEverUsed = true;

  const currentColor = generateCurrentColor(groupName);
  const groupNameFormat = formatGroupName(groupName);
  const groupLabelStyle = getGroupLabelStyle(currentColor);
  const shouldDisplayLogInConsole = (!_whitelist || _whitelist.indexOf(groupName) > -1) && (!_blacklist || _blacklist.indexOf(groupName) === -1);

  const _nicerLog = shouldDisplayLogInConsole ? console.log.bind(console, groupNameFormat, ...groupLabelStyle) : () => undefined;

  _nicerLog.async = shouldDisplayLogInConsole ? (label: string, promise: Promise<any>, ...additionalInfo: any[]) => {
    logWithoutSource(
      `${groupNameFormat}%cPENDING%c${label}`,
      ...groupLabelStyle,
      getAsyncStatusLabelStyle('blue'),
      getAsyncDescriptionLabelStyle(currentColor),
      ...additionalInfo
    );
    promise
      .then(ret =>
        logWithoutSource(
          `${groupNameFormat}%cFULFILLED%c${label}`,
          ...groupLabelStyle,
          getAsyncStatusLabelStyle('green'),
          getAsyncDescriptionLabelStyle(currentColor),
          ...(ret ? [ret] : [])
        )
      )
      .catch(ex => {
        logWithoutSource(
          `${groupNameFormat}%cREJECTED%c${label}`,
          ...groupLabelStyle,
          getAsyncStatusLabelStyle('red'),
          getAsyncDescriptionLabelStyle(currentColor),
          ...(ex ? ['\n\n', ex, '\n\n'] : [])
        );
        throw ex;
      });
  } : () => undefined;

  return _nicerLog;
}
