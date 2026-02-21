import {XMLParser} from 'fast-xml-parser';

type XmlTextNode = { '#text': string | number };
type XmlChildNode = { [tagName: string]: XmlNode[] } & { ':@'?: Record<string, string> };
type XmlNode = XmlTextNode | XmlChildNode;

type ParsedItem = Record<string, string>;
type ParsedResult = Record<string, string | Record<string, ParsedItem> | ParsedItem[]>;

/**
 * フラットなXMLをオブジェクトに変換するフック
 *
 * @param delimiter 繰り返しセクションの区切り要素名
 * @param groupName 変換後の配列キー名
 */
export function useFlatXmlParser(delimiter = 'SERVICE_TYPE', groupName = 'services') {
  const xmlParser = new XMLParser({preserveOrder: true, ignoreAttributes: true, parseTagValue: false});

  function parseChildren(children: XmlNode[]): ParsedResult {
    const result: ParsedResult = {};
    const items: ParsedItem[] = [];
    let currentItem: ParsedItem | null = null;
    let inItemSection = false;

    for (const child of children) {
      if ('#text' in child) continue;

      const name = Object.keys(child).find(k => k !== ':@');
      if (!name) continue;

      const childNodes = (child as XmlChildNode)[name] as XmlNode[];
      const textNode = childNodes.find((n): n is XmlTextNode => '#text' in n);
      const value = textNode ? String(textNode['#text']) : '';

      if (name === delimiter) {
        // 新しいセクション開始
        if (currentItem !== null) {
          items.push(currentItem);
        }
        currentItem = {[delimiter]: value};
        inItemSection = true;
      } else if (inItemSection) {
        // セクション内の要素
        currentItem![name] = value;
      } else {
        // ヘッダ要素
        result[name] = value;
      }
    }

    // 最後のアイテムを追加
    if (currentItem !== null) {
      items.push(currentItem);
    }

    result[groupName] = items;
    return result;
  }

  /** XMLファイルをオブジェクトに変換 */
  function parse(content: string): ParsedResult {
    const parsed = xmlParser.parse(content) as XmlChildNode[];

    // ルート要素を探す（XML宣言を除く）
    const rootEntry = parsed.find(node => !('?xml' in node) && !('#text' in node));
    if (!rootEntry) {
      throw new Error(`Failed to parse XML`);
    }

    const rootTagName = Object.keys(rootEntry).find(k => k !== ':@');
    if (!rootTagName) {
      throw new Error(`No root element found`);
    }

    const children = rootEntry[rootTagName] as XmlNode[];
    return parseChildren(children);
  }

  /** 区切り要素をキーにした連想配列で取得 */
  function parseIndexed(content: string): ParsedResult {
    const data = parse(content);
    const items = data[groupName] as ParsedItem[];

    const indexed: Record<string, ParsedItem> = {};
    for (const item of items) {
      indexed[item[delimiter]] = item;
    }
    data[groupName] = indexed;

    return data;
  }

  return {parse, parseIndexed};
}
