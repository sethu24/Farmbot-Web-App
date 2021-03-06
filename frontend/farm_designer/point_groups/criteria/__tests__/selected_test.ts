import {
  eqCriteriaSelected, criteriaHasKey, hasSubCriteria, typeDisabled,
} from "..";
import { DEFAULT_CRITERIA, PointGroupCriteria } from "../interfaces";
import { cloneDeep } from "lodash";

const fakeCriteria = (): PointGroupCriteria =>
  cloneDeep(DEFAULT_CRITERIA);

describe("eqCriteriaSelected()", () => {
  it("returns selected numbers", () => {
    const criteria = fakeCriteria();
    criteria.number_eq = { pullout_direction: [0] };
    const result = eqCriteriaSelected(criteria)("pullout_direction", 0);
    expect(result).toEqual(true);
  });

  it("returns numbers not selected", () => {
    const criteria = fakeCriteria();
    criteria.number_eq = {};
    const result = eqCriteriaSelected(criteria)("pullout_direction", 0);
    expect(result).toEqual(false);
  });

  it("returns selected strings", () => {
    const criteria = fakeCriteria();
    criteria.string_eq = { plant_stage: ["planted"] };
    const result = eqCriteriaSelected(criteria)("plant_stage", "planted");
    expect(result).toEqual(true);
  });

  it("returns strings not selected", () => {
    const criteria = fakeCriteria();
    criteria.string_eq = {};
    const result = eqCriteriaSelected(criteria)("plant_stage", "planted");
    expect(result).toEqual(false);
  });

  it("returns other not selected", () => {
    const criteria = fakeCriteria();
    const result = eqCriteriaSelected(criteria)(
      "pullout_direction", false as unknown as string);
    expect(result).toEqual(false);
  });
});

describe("criteriaHasKey()", () => {
  it("has key", () => {
    const criteria = fakeCriteria();
    criteria.string_eq = { plant_stage: ["planted"] };
    const result = criteriaHasKey(criteria, ["string_eq"], "plant_stage");
    expect(result).toBeTruthy();
  });

  it("doesn't have key", () => {
    const criteria = fakeCriteria();
    criteria.string_eq = {};
    const result = criteriaHasKey(criteria, ["string_eq"], "plant_stage");
    expect(result).toBeFalsy();
  });

  it("has key", () => {
    const criteria = fakeCriteria();
    criteria.number_eq = { x: [0] };
    const result = criteriaHasKey(criteria, ["number_eq"], "x");
    expect(result).toBeTruthy();
  });
});

describe("hasSubCriteria()", () => {
  it("has string criteria", () => {
    const criteria = fakeCriteria();
    criteria.string_eq = { plant_stage: ["planted"] };
    const result = hasSubCriteria(criteria)("Plant");
    expect(result).toBeTruthy();
  });

  it("doesn't have string criteria", () => {
    const criteria = fakeCriteria();
    criteria.string_eq = { "meta.color": ["red"] };
    const result = hasSubCriteria(criteria)("Plant");
    expect(result).toBeFalsy();
  });

  it("has number criteria", () => {
    const criteria = fakeCriteria();
    criteria.number_eq = { pullout_direction: [0] };
    const result = hasSubCriteria(criteria)("ToolSlot");
    expect(result).toBeTruthy();
  });

  it("doesn't have number criteria", () => {
    const criteria = fakeCriteria();
    criteria.number_eq = {};
    const result = hasSubCriteria(criteria)("ToolSlot");
    expect(result).toBeFalsy();
  });
});

describe("typeDisabled()", () => {
  it("is disabled", () => {
    const criteria = fakeCriteria();
    criteria.string_eq = { "meta.color": ["red"] };
    const result = typeDisabled(criteria, "Plant");
    expect(result).toBeTruthy();
  });

  it("isn't disabled", () => {
    const criteria = fakeCriteria();
    criteria.string_eq = { plant_stage: ["planted"] };
    const result = typeDisabled(criteria, "Plant");
    expect(result).toBeFalsy();
  });
});
