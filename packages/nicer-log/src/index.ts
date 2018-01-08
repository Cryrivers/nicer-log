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

export default function nicerLog(groupName: string): typeof console.log {
  let currentColor: ColorPalette;
  if (!groupColorMap[groupName]) {
    const chosenColor = PALETTE[hashString(groupName) % PALETTE_LENGTH];
    groupColorMap[groupName] = currentColor = chosenColor;
  } else {
    currentColor = groupColorMap[groupName];
  }
  const bracketStyle = `color: ${currentColor.backgroundColor}; background: ${
    currentColor.backgroundColor
  }; padding: 2px 0;`;
  const textStyle = `color: ${currentColor.textColor}; background: ${currentColor.backgroundColor}; padding: 2px 0;`;

  return console.log.bind(console, `%c[%c${groupName}%c]`, bracketStyle, textStyle, bracketStyle);
}
