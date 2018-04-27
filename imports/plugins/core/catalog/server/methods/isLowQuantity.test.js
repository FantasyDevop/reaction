import {
  rewire as rewire$getVariantQuantity,
  restore as restore$getVariantQuantity
} from "/imports/plugins/core/revisions/server/no-meteor/getVariantQuantity";
import isLowQuantity from "./isLowQuantity";

const mockGetVariantQuantity = jest.fn().mockName("ProductRevision.getVariantQuantity");

// mock collections
const mockCollections = {};

// mock variant
const mockVariantWithInventoryManagment = {
  inventoryManagement: true,
  inventoryPolicy: true,
  lowInventoryWarningThreshold: 5
};

const mockVariantWithOutInventoryManagment = {
  inventoryManagement: false,
  inventoryPolicy: false,
  lowInventoryWarningThreshold: 0
};

beforeAll(() => {
  rewire$getVariantQuantity(mockGetVariantQuantity);
});

afterAll(restore$getVariantQuantity);

test("expect true when a single product variant has a low quantity and inventory controls are enabled", async () => {
  mockGetVariantQuantity.mockReturnValueOnce(Promise.resolve(2));
  const spec = await isLowQuantity([mockVariantWithInventoryManagment], mockCollections);
  expect(spec).toBe(true);
});

test("expect true when an array of product variants each have a low quantity and inventory controls are enabled", async () => {
  mockGetVariantQuantity.mockReturnValueOnce(Promise.resolve(2)).mockReturnValueOnce(Promise.resolve(2));
  const spec = await isLowQuantity(
    [mockVariantWithInventoryManagment, mockVariantWithInventoryManagment],
    mockCollections
  );
  expect(spec).toBe(true);
});

test("expect false when a single product variant does not have a low quantity and inventory controls are enabled", async () => {
  mockGetVariantQuantity.mockReturnValueOnce(Promise.resolve(10));
  const spec = await isLowQuantity([mockVariantWithInventoryManagment], mockCollections);
  expect(spec).toBe(false);
});

test("expect false when an array of product variants each do not have a low quantity and inventory controls are enabled", async () => {
  mockGetVariantQuantity.mockReturnValueOnce(Promise.resolve(10)).mockReturnValueOnce(Promise.resolve(10));
  const spec = await isLowQuantity(
    [mockVariantWithInventoryManagment, mockVariantWithInventoryManagment],
    mockCollections
  );
  expect(spec).toBe(false);
});

test("expect false when a single product variant has a low quantity and inventory controls are disabled", async () => {
  mockGetVariantQuantity.mockReturnValueOnce(Promise.resolve(2));
  const spec = await isLowQuantity([mockVariantWithOutInventoryManagment], mockCollections);
  expect(spec).toBe(false);
});

test("expect false when an array of product variants each have a low quantity and inventory controls are disabled", async () => {
  mockGetVariantQuantity.mockReturnValueOnce(Promise.resolve(2)).mockReturnValueOnce(Promise.resolve(2));
  const spec = await isLowQuantity(
    [mockVariantWithOutInventoryManagment, mockVariantWithOutInventoryManagment],
    mockCollections
  );
  expect(spec).toBe(false);
});
