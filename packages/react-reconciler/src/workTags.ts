export type WorkTag =
	| typeof FunctionComponent
	| typeof HostRoot
	| typeof HostComponent
	| typeof HostText;
// 函数组件
export const FunctionComponent = 0;
/**
 * 应用在宿主环境挂载的根节点
 * const rootElement = document.getElementById('root');
 */
export const HostRoot = 3;
// 原生 Element 类型，如 DIV、SPAN
export const HostComponent = 5;
// 文本元素类型
export const HostText = 6;
