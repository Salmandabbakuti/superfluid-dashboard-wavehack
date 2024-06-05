import { newMockEvent } from "matchstick-as"
import { ethereum, Bytes, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  CodeUpdated,
  FlowOperatorUpdated,
  FlowUpdated,
  FlowUpdatedExtension,
  Initialized
} from "../generated/ConstantFlowAgreementV1/ConstantFlowAgreementV1"

export function createCodeUpdatedEvent(
  uuid: Bytes,
  codeAddress: Address
): CodeUpdated {
  let codeUpdatedEvent = changetype<CodeUpdated>(newMockEvent())

  codeUpdatedEvent.parameters = new Array()

  codeUpdatedEvent.parameters.push(
    new ethereum.EventParam("uuid", ethereum.Value.fromFixedBytes(uuid))
  )
  codeUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "codeAddress",
      ethereum.Value.fromAddress(codeAddress)
    )
  )

  return codeUpdatedEvent
}

export function createFlowOperatorUpdatedEvent(
  token: Address,
  sender: Address,
  flowOperator: Address,
  permissions: i32,
  flowRateAllowance: BigInt
): FlowOperatorUpdated {
  let flowOperatorUpdatedEvent = changetype<FlowOperatorUpdated>(newMockEvent())

  flowOperatorUpdatedEvent.parameters = new Array()

  flowOperatorUpdatedEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  flowOperatorUpdatedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )
  flowOperatorUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "flowOperator",
      ethereum.Value.fromAddress(flowOperator)
    )
  )
  flowOperatorUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "permissions",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(permissions))
    )
  )
  flowOperatorUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "flowRateAllowance",
      ethereum.Value.fromSignedBigInt(flowRateAllowance)
    )
  )

  return flowOperatorUpdatedEvent
}

export function createFlowUpdatedEvent(
  token: Address,
  sender: Address,
  receiver: Address,
  flowRate: BigInt,
  totalSenderFlowRate: BigInt,
  totalReceiverFlowRate: BigInt,
  userData: Bytes
): FlowUpdated {
  let flowUpdatedEvent = changetype<FlowUpdated>(newMockEvent())

  flowUpdatedEvent.parameters = new Array()

  flowUpdatedEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  flowUpdatedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )
  flowUpdatedEvent.parameters.push(
    new ethereum.EventParam("receiver", ethereum.Value.fromAddress(receiver))
  )
  flowUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "flowRate",
      ethereum.Value.fromSignedBigInt(flowRate)
    )
  )
  flowUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "totalSenderFlowRate",
      ethereum.Value.fromSignedBigInt(totalSenderFlowRate)
    )
  )
  flowUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "totalReceiverFlowRate",
      ethereum.Value.fromSignedBigInt(totalReceiverFlowRate)
    )
  )
  flowUpdatedEvent.parameters.push(
    new ethereum.EventParam("userData", ethereum.Value.fromBytes(userData))
  )

  return flowUpdatedEvent
}

export function createFlowUpdatedExtensionEvent(
  flowOperator: Address,
  deposit: BigInt
): FlowUpdatedExtension {
  let flowUpdatedExtensionEvent = changetype<FlowUpdatedExtension>(
    newMockEvent()
  )

  flowUpdatedExtensionEvent.parameters = new Array()

  flowUpdatedExtensionEvent.parameters.push(
    new ethereum.EventParam(
      "flowOperator",
      ethereum.Value.fromAddress(flowOperator)
    )
  )
  flowUpdatedExtensionEvent.parameters.push(
    new ethereum.EventParam(
      "deposit",
      ethereum.Value.fromUnsignedBigInt(deposit)
    )
  )

  return flowUpdatedExtensionEvent
}

export function createInitializedEvent(version: i32): Initialized {
  let initializedEvent = changetype<Initialized>(newMockEvent())

  initializedEvent.parameters = new Array()

  initializedEvent.parameters.push(
    new ethereum.EventParam(
      "version",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(version))
    )
  )

  return initializedEvent
}
