import { doesRoleHaveHighEnoughPermissions } from "@atomicsmash/test-utils";
import { expect, test, describe } from "vitest";

describe.concurrent("doesRoleHaveHighEnoughPermissions()", () => {
	test("unauthenticated users", () => {
		const userRole = "unauthenticated";
		expect(doesRoleHaveHighEnoughPermissions(userRole, "super-admin")).toBe(
			false,
		);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "admin")).toBe(false);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "shop-manager")).toBe(
			false,
		);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "editor")).toBe(false);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "author")).toBe(false);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "contributor")).toBe(
			false,
		);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "customer")).toBe(false);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "subscriber")).toBe(
			false,
		);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "unauthenticated")).toBe(
			true,
		);
	});

	test("subscriber users", () => {
		const userRole = "subscriber";
		expect(doesRoleHaveHighEnoughPermissions(userRole, "super-admin")).toBe(
			false,
		);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "admin")).toBe(false);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "shop-manager")).toBe(
			false,
		);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "editor")).toBe(false);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "author")).toBe(false);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "contributor")).toBe(
			false,
		);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "customer")).toBe(false);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "subscriber")).toBe(
			true,
		);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "unauthenticated")).toBe(
			true,
		);
	});

	test("customer users", () => {
		const userRole = "customer";
		expect(doesRoleHaveHighEnoughPermissions(userRole, "super-admin")).toBe(
			false,
		);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "admin")).toBe(false);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "shop-manager")).toBe(
			false,
		);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "editor")).toBe(false);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "author")).toBe(false);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "contributor")).toBe(
			false,
		);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "customer")).toBe(true);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "subscriber")).toBe(
			true,
		);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "unauthenticated")).toBe(
			true,
		);
	});

	test("contributor users", () => {
		const userRole = "contributor";
		expect(doesRoleHaveHighEnoughPermissions(userRole, "super-admin")).toBe(
			false,
		);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "admin")).toBe(false);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "shop-manager")).toBe(
			false,
		);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "editor")).toBe(false);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "author")).toBe(false);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "contributor")).toBe(
			true,
		);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "customer")).toBe(true);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "subscriber")).toBe(
			true,
		);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "unauthenticated")).toBe(
			true,
		);
	});

	test("author users", () => {
		const userRole = "author";
		expect(doesRoleHaveHighEnoughPermissions(userRole, "super-admin")).toBe(
			false,
		);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "admin")).toBe(false);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "shop-manager")).toBe(
			false,
		);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "editor")).toBe(false);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "author")).toBe(true);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "contributor")).toBe(
			true,
		);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "customer")).toBe(true);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "subscriber")).toBe(
			true,
		);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "unauthenticated")).toBe(
			true,
		);
	});

	test("editor users", () => {
		const userRole = "editor";
		expect(doesRoleHaveHighEnoughPermissions(userRole, "super-admin")).toBe(
			false,
		);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "admin")).toBe(false);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "shop-manager")).toBe(
			false,
		);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "editor")).toBe(true);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "author")).toBe(true);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "contributor")).toBe(
			true,
		);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "customer")).toBe(true);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "subscriber")).toBe(
			true,
		);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "unauthenticated")).toBe(
			true,
		);
	});

	test("shop-manager users", () => {
		const userRole = "shop-manager";
		expect(doesRoleHaveHighEnoughPermissions(userRole, "super-admin")).toBe(
			false,
		);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "admin")).toBe(false);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "shop-manager")).toBe(
			true,
		);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "editor")).toBe(true);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "author")).toBe(true);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "contributor")).toBe(
			true,
		);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "customer")).toBe(true);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "subscriber")).toBe(
			true,
		);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "unauthenticated")).toBe(
			true,
		);
	});

	test("admin users", () => {
		const userRole = "admin";
		expect(doesRoleHaveHighEnoughPermissions(userRole, "super-admin")).toBe(
			false,
		);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "admin")).toBe(true);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "shop-manager")).toBe(
			true,
		);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "editor")).toBe(true);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "author")).toBe(true);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "contributor")).toBe(
			true,
		);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "customer")).toBe(true);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "subscriber")).toBe(
			true,
		);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "unauthenticated")).toBe(
			true,
		);
	});

	test("super-admin users", () => {
		const userRole = "super-admin";
		expect(doesRoleHaveHighEnoughPermissions(userRole, "super-admin")).toBe(
			true,
		);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "admin")).toBe(true);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "shop-manager")).toBe(
			true,
		);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "editor")).toBe(true);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "author")).toBe(true);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "contributor")).toBe(
			true,
		);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "customer")).toBe(true);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "subscriber")).toBe(
			true,
		);
		expect(doesRoleHaveHighEnoughPermissions(userRole, "unauthenticated")).toBe(
			true,
		);
	});
});
