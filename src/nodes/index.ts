import type { NodeTypes } from 'reactflow'
import ClickNode from './ActionNodes/ClickNode'
import FocusWindowNode from './ActionNodes/FocusWindowNode'
import KeyInputNode from './ActionNodes/KeyInputNode'
import DragNode from './ActionNodes/DragNode'
import DelayNode from './ActionNodes/DelayNode'
import ImageMatchNode from './ConditionNodes/ImageMatchNode'
import OCRReadNode from './ConditionNodes/OCRReadNode'
import WaitForImageNode from './ConditionNodes/WaitForImageNode'
import LoopNode from './ControlNodes/LoopNode'
import SequenceNode from './ControlNodes/SequenceNode'
import SubFlowNode from './ControlNodes/SubFlowNode'
import StartNode from './ControlNodes/StartNode'

export const NODE_TYPES: NodeTypes = {
  Start: StartNode,
  Click: ClickNode,
  FocusWindow: FocusWindowNode,
  KeyInput: KeyInputNode,
  Drag: DragNode,
  Delay: DelayNode,
  ImageMatch: ImageMatchNode,
  OCRRead: OCRReadNode,
  WaitForImage: WaitForImageNode,
  Loop: LoopNode,
  Sequence: SequenceNode,
  SubFlow: SubFlowNode
}
