import { ReactElementType } from 'shared/ReactTypes';
import { FiberNode, createFiberFromElement } from './fiber';
import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import { HostText } from './workTags';
import { Placement } from './fiberFlags';

/**
 *
 * @param shouldTrackEffects 是否标记副作用
 *
 * @returns
 */
function ChildReconciler(shouldTrackEffects: boolean) {
	function reconcileSingleElement(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		element: ReactElementType
	) {
		// 根据 element 创建 fiber
		const fiber = createFiberFromElement(element);
		// 与父 FiberNode 连接
		fiber.return = returnFiber;
		return fiber;
	}

	function reconcileSingleTextNode(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		content: number | string
	) {
		const fiber = new FiberNode(HostText, { content }, null);
		// 与父 FiberNode 连接
		fiber.return = returnFiber;
		return fiber;
	}

	/**
	 * beginWork 性能优化策略
	 *
	 */
	function placeSingleChild(fiber: FiberNode) {
		// 标记副作用 && 同级 Current FiberNode 不存在
		if (shouldTrackEffects && fiber.alternate === null) {
			// 标记副作用
			/**
			 * 注意：mount 时，<App/> 对应的 FiberNode.flags 会被标记为 Placement
			 * 因为 WorkInProgress HostRootFiber 存在 Current HostRootFiber
			 *
			 */
			fiber.flags |= Placement;
		}
		return fiber;
	}

	return function reconcileChildFibers(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		newChild?: ReactElementType
	) {
		// 判断 newChild 类型
		// 叶子结点
		if (typeof newChild === 'object' && newChild !== null) {
			switch (newChild.$$typeof) {
				case REACT_ELEMENT_TYPE:
					return placeSingleChild(
						reconcileSingleElement(returnFiber, currentFiber, newChild)
					);
				default:
					if (__DEV__) {
						console.warn('未实现的reconcile类型', newChild);
					}
					break;
			}
		}
		// TODO 多个子节点 ul> li*3

		// 叶子结点 HostText
		if (typeof newChild === 'string' || typeof newChild === 'number') {
			return placeSingleChild(
				reconcileSingleTextNode(returnFiber, currentFiber, newChild)
			);
		}

		if (__DEV__) {
			console.warn('未实现的reconcile类型', newChild);
		}
		return null;
	};
}

export const reconcileChildFibers = ChildReconciler(true);
export const mountChildFibers = ChildReconciler(false);
