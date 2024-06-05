import {
  CodeUpdated as CodeUpdatedEvent,
  FlowOperatorUpdated as FlowOperatorUpdatedEvent,
  FlowUpdated as FlowUpdatedEvent,
  FlowUpdatedExtension as FlowUpdatedExtensionEvent,
  Initialized as InitializedEvent
} from "../generated/ConstantFlowAgreementV1/ConstantFlowAgreementV1"
import {
  CodeUpdated,
  FlowOperatorUpdated,
  FlowUpdated,
  FlowUpdatedExtension,
  Initialized
} from "../generated/schema"

export function handleCodeUpdated(event: CodeUpdatedEvent): void {
  let entity = new CodeUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.uuid = event.params.uuid
  entity.codeAddress = event.params.codeAddress

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFlowOperatorUpdated(
  event: FlowOperatorUpdatedEvent
): void {
  let entity = new FlowOperatorUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.token = event.params.token
  entity.sender = event.params.sender
  entity.flowOperator = event.params.flowOperator
  entity.permissions = event.params.permissions
  entity.flowRateAllowance = event.params.flowRateAllowance

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFlowUpdated(event: FlowUpdatedEvent): void {
  let entity = new FlowUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.token = event.params.token
  entity.sender = event.params.sender
  entity.receiver = event.params.receiver
  entity.flowRate = event.params.flowRate
  entity.totalSenderFlowRate = event.params.totalSenderFlowRate
  entity.totalReceiverFlowRate = event.params.totalReceiverFlowRate
  entity.userData = event.params.userData

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFlowUpdatedExtension(
  event: FlowUpdatedExtensionEvent
): void {
  let entity = new FlowUpdatedExtension(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.flowOperator = event.params.flowOperator
  entity.deposit = event.params.deposit

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleInitialized(event: InitializedEvent): void {
  let entity = new Initialized(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.version = event.params.version

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
