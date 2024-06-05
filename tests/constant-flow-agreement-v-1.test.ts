import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Bytes, Address, BigInt } from "@graphprotocol/graph-ts"
import { CodeUpdated } from "../generated/schema"
import { CodeUpdated as CodeUpdatedEvent } from "../generated/ConstantFlowAgreementV1/ConstantFlowAgreementV1"
import { handleCodeUpdated } from "../src/constant-flow-agreement-v-1"
import { createCodeUpdatedEvent } from "./constant-flow-agreement-v-1-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let uuid = Bytes.fromI32(1234567890)
    let codeAddress = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let newCodeUpdatedEvent = createCodeUpdatedEvent(uuid, codeAddress)
    handleCodeUpdated(newCodeUpdatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("CodeUpdated created and stored", () => {
    assert.entityCount("CodeUpdated", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "CodeUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "uuid",
      "1234567890"
    )
    assert.fieldEquals(
      "CodeUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "codeAddress",
      "0x0000000000000000000000000000000000000001"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
