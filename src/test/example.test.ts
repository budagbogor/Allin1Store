import { describe, it, expect } from "vitest";
import { getTopModelKendaraan, getTopPekerjaan, splitJenisPekerjaan, type SalesEntry } from "@/lib/data";

describe("example", () => {
  it("should pass", () => {
    expect(true).toBe(true);
  });
});

describe("jenis pekerjaan multi", () => {
  it("splitJenisPekerjaan memecah string multi dengan benar", () => {
    expect(splitJenisPekerjaan("Ganti MAF | Ganti O2")).toEqual(["Ganti MAF", "Ganti O2"]);
    expect(splitJenisPekerjaan("Ganti MAF|Ganti O2")).toEqual(["Ganti MAF", "Ganti O2"]);
    expect(splitJenisPekerjaan("  Ganti MAF  |   ")).toEqual(["Ganti MAF"]);
  });

  it("getTopPekerjaan menghitung semua jenis pekerjaan dari 1 unit", () => {
    const entries: SalesEntry[] = [
      {
        id: "1",
        tanggal: "2026-01-01",
        merekKendaraan: "Toyota",
        modelKendaraan: "Avanza",
        jenisPekerjaan: "A | B",
        jumlahSales: 100,
      },
      {
        id: "2",
        tanggal: "2026-01-02",
        merekKendaraan: "Toyota",
        modelKendaraan: "Avanza",
        jenisPekerjaan: "A",
        jumlahSales: 50,
      },
    ];

    const top = getTopPekerjaan(entries, 5);
    const map = Object.fromEntries(top.map((t) => [t.name, t.value]));

    expect(map["A"]).toBeCloseTo(100);
    expect(map["B"]).toBeCloseTo(50);
  });
});

describe("top model kendaraan", () => {
  it("getTopModelKendaraan menghitung jumlah unit per model", () => {
    const entries: SalesEntry[] = [
      {
        id: "1",
        tanggal: "2026-01-01",
        merekKendaraan: "Toyota",
        modelKendaraan: "Avanza",
        jenisPekerjaan: "A",
        jumlahSales: 100,
      },
      {
        id: "2",
        tanggal: "2026-01-02",
        merekKendaraan: "Toyota",
        modelKendaraan: "Avanza",
        jenisPekerjaan: "A",
        jumlahSales: 50,
      },
      {
        id: "3",
        tanggal: "2026-01-03",
        merekKendaraan: "Honda",
        modelKendaraan: "Brio",
        jenisPekerjaan: "A",
        jumlahSales: 10,
      },
    ];

    const top = getTopModelKendaraan(entries, 10);
    expect(top[0]).toEqual({ name: "Avanza", value: 2 });
    expect(top[1]).toEqual({ name: "Brio", value: 1 });
  });
});
