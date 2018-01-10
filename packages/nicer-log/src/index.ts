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

function hashString(str: string): number {
  // tslint:disable:no-bitwise
  let hash = 0;
  if (str.length === 0) {
    return hash;
  } else {
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash | 0;
    }
    return Math.abs(hash);
  }
}

export interface NicerLog {
  /**
   * @description
   * Blablabla
   */
  (message?: any, ...optionalParams: any[]): void;
  async(label: string, promise: Promise<any>): void;
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
    const chosenColor = PALETTE[hashString(groupName) % PALETTE_LENGTH];
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

export default function nicerLog(groupName: string): NicerLog {
  const currentColor = generateCurrentColor(groupName);
  const groupNameFormat = formatGroupName(groupName);
  const groupLabelStyle = getGroupLabelStyle(currentColor);

  const _nicerLog = console.log.bind(console, groupNameFormat, ...groupLabelStyle);

  _nicerLog.async = (label: string, promise: Promise<any>) => {
    logWithoutSource(
      `${groupNameFormat}%cPENDING%c${label}`,
      ...groupLabelStyle,
      getAsyncStatusLabelStyle('blue'),
      getAsyncDescriptionLabelStyle(currentColor)
    );
    promise
      .then(ret =>
        logWithoutSource(
          `${groupNameFormat}%cFULFILLED%c${label}`,
          ...groupLabelStyle,
          getAsyncStatusLabelStyle('green'),
          getAsyncDescriptionLabelStyle(currentColor),
          ...(ret ? ['\n\n', ret, '\n\n'] : [])
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
  };

  return _nicerLog;
}
