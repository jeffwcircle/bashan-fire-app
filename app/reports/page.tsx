
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Database } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";

import { db } from "@/lib/firebase";
import PageContainer from "@/components/PageContainer";

const dataSources = [
  { label: "Truck Check Logs", database: "Firestore", collection: "truckLogs" },
  { label: "Truck Templates", database: "Firestore", collection: "truckTemplates" },
  { label: "Truck Mileage Logs", database: "Firestore", collection: "truckMileageLogs" },
  { label: "Maintenance Logs", database: "Firestore", collection: "maintenanceLogs" },
  { label: "Equipment Inventory", database: "Firestore", collection: "equipmentInventory" },
  { label: "Maintenance Inventory", database: "Firestore", collection: "maintenanceInventory" },
  { label: "Upcoming Events", database: "Firestore", collection: "upcomingEvents" },
  { label: "Firefighter Profiles", database: "Supabase", collection: "profiles" },
  { label: "Firefighter Status", database: "Supabase", collection: "firefighter_status" },
];

type ReportRecord = Record<string, any>;

function formatValue(value: any): string {
  if (value == null) return "";

  if (typeof value !== "object") return String(value);

  if (typeof value.toDate === "function") {
    return value.toDate().toLocaleString();
  }

  if (Array.isArray(value)) {
    return value.map(formatValue).filter(Boolean).join("; ");
  }

  if (Array.isArray(value.items)) {
    const bayName = value.name ?? "Bay";

    const equipment = value.items
      .map((item: ReportRecord) => {
        const name = item.name ?? "Unnamed item";
        const status = item.status ? ` (${item.status})` : "";
        return `${name}${status}`;
      })
      .join(", ");

    return equipment ? `${bayName}: ${equipment}` : bayName;
  }

  return Object.entries(value)
    .map(([key, nestedValue]) => `${key}: ${formatValue(nestedValue)}`)
    .filter((entry) => !entry.endsWith(": "))
    .join(", ");
}

function getReportFields(records: ReportRecord[]) {
  return Array.from(
    new Set(records.flatMap((record) => Object.keys(record)))
  ).filter(
    (field) =>
      field !== "id" &&
      field.toLowerCase().replace(/[_\s-]/g, "") !== "availableusers"
  );
}

function getDateValue(value: any): Date | null {
  if (!value) return null;

  if (typeof value.toDate === "function") {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (typeof value.seconds === "number") {
    return new Date(value.seconds * 1000);
  }

  return null;
}

function getRecordDate(record: ReportRecord, source: string): Date | null {
  if (source === "truckLogs" || source === "maintenanceLogs") {
    return getDateValue(record.createdAt);
  }

  if (source === "truckMileageLogs") {
    return getDateValue(record.date);
  }

  return null;
}

function getRecordTruck(record: ReportRecord, source: string): string {
  if (source === "truckMileageLogs") {
    return String(record.truckName ?? record.truck ?? "");
  }

  return String(record.truck ?? "");
}

function getRecordCrew(record: ReportRecord): string {
  const crew = record.crew;

  if (Array.isArray(crew)) {
    return crew.map((person) => String(person)).join(", ");
  }

  if (crew && typeof crew === "object") {
    return Object.values(crew).map(String).join(", ");
  }

  return String(crew ?? "");
}

function getAnnualValue(record: ReportRecord): string {
  const value = record.annual;

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (value == null || value === "") {
    return "Not specified";
  }

  return String(value);
}

export default function ReportsPage() {
  const router = useRouter();

  const [selectedSource, setSelectedSource] = useState("");
  const [records, setRecords] = useState<ReportRecord[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedTruck, setSelectedTruck] = useState("");
  const [selectedCrew, setSelectedCrew] = useState("");
  const [selectedAnnual, setSelectedAnnual] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [inventoryName, setInventoryName] = useState("");
  const [inventoryCategory, setInventoryCategory] = useState("");
  const [inventoryStatus, setInventoryStatus] = useState("__ACTIVE__");
  const [equipmentName, setEquipmentName] = useState("");
  const [equipmentCategory, setEquipmentCategory] = useState("");
  const [equipmentStatus, setEquipmentStatus] = useState("");
  const [equipmentLocation, setEquipmentLocation] = useState("");
  const [eventSearch, setEventSearch] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");

  const source = dataSources.find(
    (item) => item.collection === selectedSource
  );

  const fields = useMemo(() => getReportFields(records), [records]);

  const isTruckCheckReport = selectedSource === "truckLogs";
  const isMileageReport = selectedSource === "truckMileageLogs";
  const isMaintenanceReport = selectedSource === "maintenanceLogs";
  const isInventoryReport = selectedSource === "maintenanceInventory";
  const isEquipmentReport = selectedSource === "equipmentInventory";
  const isEventsReport = selectedSource === "upcomingEvents";

  const hasTruckFilters =
    isTruckCheckReport || isMileageReport || isMaintenanceReport;

  const truckNames = useMemo(() => {
    if (!hasTruckFilters) return [];

    return Array.from(
      new Set(
        records
          .map((record) => getRecordTruck(record, selectedSource))
          .filter((truck) => truck.trim() !== "")
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [records, hasTruckFilters, selectedSource]);

  const crewNames = useMemo(() => {
    if (!isMaintenanceReport) return [];

    return Array.from(
      new Set(
        records
          .map(getRecordCrew)
          .filter((crew) => crew.trim() !== "")
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [records, isMaintenanceReport]);

  const annualOptions = useMemo(() => {
    if (!isMaintenanceReport) return [];

    return Array.from(
      new Set(records.map(getAnnualValue))
    ).sort((a, b) => a.localeCompare(b));
  }, [records, isMaintenanceReport]);

  const inventoryCategories = useMemo(() => {
    if (!isInventoryReport) return [];
    return Array.from(new Set(records.map((record) => String(record.category ?? "").trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  }, [records, isInventoryReport]);

  const inventoryStatuses = useMemo(() => {
    if (!isInventoryReport) return [];
    return Array.from(new Set(records.map((record) => String(record.status ?? "").trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  }, [records, isInventoryReport]);

  const equipmentCategories = useMemo(() => {
    if (!isEquipmentReport) return [];
    return Array.from(new Set(records.map((record) => String(record.category ?? "").trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  }, [records, isEquipmentReport]);

  const equipmentStatuses = useMemo(() => {
    if (!isEquipmentReport) return [];
    return Array.from(new Set(records.map((record) => String(record.status ?? "").trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  }, [records, isEquipmentReport]);

  const equipmentLocations = useMemo(() => {
    if (!isEquipmentReport) return [];
    return Array.from(new Set(records.map((record) => String(record.location ?? record.assignedTo ?? "").trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  }, [records, isEquipmentReport]);

  const eventTypes = useMemo(() => {
    if (!isEventsReport) return [];
    return Array.from(new Set(records.map((record) => String(record.type ?? record.eventType ?? record.category ?? "").trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  }, [records, isEventsReport]);

  function getEventDate(record: ReportRecord): Date | null {
    return getDateValue(record.date ?? record.eventDate ?? record.startDate ?? record.start ?? record.createdAt);
  }

  const filteredRecords = useMemo(() => {
    if (!hasTruckFilters && !isInventoryReport && !isEquipmentReport && !isEventsReport) return records;

    return records.filter((record) => {
      if (isEquipmentReport) {
        const name = String(record.name ?? record.itemName ?? record.equipmentName ?? "");
        const category = String(record.category ?? "");
        const status = String(record.status ?? "");
        const location = String(record.location ?? record.assignedTo ?? "");
        if (equipmentName.trim() && !name.toLowerCase().includes(equipmentName.trim().toLowerCase())) return false;
        if (equipmentCategory && category !== equipmentCategory) return false;
        if (equipmentStatus && status !== equipmentStatus) return false;
        if (equipmentLocation && location !== equipmentLocation) return false;
        return true;
      }

      if (isEventsReport) {
        const searchable = [record.title, record.name, record.eventName, record.description, record.location].map((value) => String(value ?? "")).join(" ").toLowerCase();
        const type = String(record.type ?? record.eventType ?? record.category ?? "");
        if (eventSearch.trim() && !searchable.includes(eventSearch.trim().toLowerCase())) return false;
        if (eventType && type !== eventType) return false;
        const eventDate = getEventDate(record);
        if (eventStartDate) {
          if (!eventDate || eventDate < new Date(`${eventStartDate}T00:00:00`)) return false;
        }
        if (eventEndDate) {
          if (!eventDate || eventDate > new Date(`${eventEndDate}T23:59:59.999`)) return false;
        }
        return true;
      }

      if (isInventoryReport) {
        const name = String(record.name ?? "");
        const category = String(record.category ?? "");
        const status = String(record.status ?? "");

        if (inventoryName.trim() && !name.toLowerCase().includes(inventoryName.trim().toLowerCase())) return false;
        if (inventoryCategory && category !== inventoryCategory) return false;
        if (inventoryStatus === "__ACTIVE__" && status.toLowerCase() === "retired") return false;
        if (inventoryStatus !== "__ACTIVE__" && status !== inventoryStatus) return false;
        return true;
      }

      const truck = getRecordTruck(record, selectedSource);

      if (selectedTruck && truck !== selectedTruck) {
        return false;
      }

      if (isMaintenanceReport) {
        const crew = getRecordCrew(record);

        if (selectedCrew && crew !== selectedCrew) {
          return false;
        }

        if (
          selectedAnnual &&
          getAnnualValue(record) !== selectedAnnual
        ) {
          return false;
        }
      }

      const recordDate = getRecordDate(record, selectedSource);

      if (startDate) {
        if (!recordDate) return false;

        const start = new Date(`${startDate}T00:00:00`);
        if (recordDate < start) return false;
      }

      if (endDate) {
        if (!recordDate) return false;

        const end = new Date(`${endDate}T23:59:59.999`);
        if (recordDate > end) return false;
      }

      return true;
    });
  }, [
    records,
    hasTruckFilters,
    selectedSource,
    selectedTruck,
    selectedCrew,
    selectedAnnual,
    startDate,
    endDate,
    isMaintenanceReport,
    isInventoryReport,
    isEquipmentReport,
    isEventsReport,
    equipmentName,
    equipmentCategory,
    equipmentStatus,
    equipmentLocation,
    eventSearch,
    eventType,
    eventStartDate,
    eventEndDate,
    inventoryName,
    inventoryCategory,
    inventoryStatus,
  ]);

  const visibleFields = fields.filter((field) =>
    selectedFields.includes(field)
  );

  useEffect(() => {
    setSelectedFields(fields);
  }, [fields]);

  useEffect(() => {
    if (!selectedSource) {
      setRecords([]);
      setError("");
      setLoading(false);
      return;
    }

    const selected = dataSources.find(
      (item) => item.collection === selectedSource
    );

    if (!selected || selected.database !== "Firestore") {
      setRecords([]);
      setError(
        "This data source is not connected yet. Currently, only Firestore sources can be previewed."
      );
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadRecords() {
      setLoading(true);
      setError("");
      setRecords([]);

      try {
        const snapshot = await getDocs(
          collection(db, selectedSource)
        );

        if (!cancelled) {
          setRecords(
            snapshot.docs.map((docSnap) => ({
              id: docSnap.id,
              ...docSnap.data(),
            }))
          );
        }
      } catch (err) {
        console.error("Error loading report records:", err);

        if (!cancelled) {
          setError(
            "Could not load records. Check Firestore permissions and the collection name."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadRecords();

    return () => {
      cancelled = true;
    };
  }, [selectedSource]);

  useEffect(() => {
    setSelectedTruck("");
    setSelectedCrew("");
    setSelectedAnnual("");
    setStartDate("");
    setEndDate("");
    setInventoryName("");
    setInventoryCategory("");
    setInventoryStatus("__ACTIVE__");
    setEquipmentName("");
    setEquipmentCategory("");
    setEquipmentStatus("");
    setEquipmentLocation("");
    setEventSearch("");
    setEventType("");
    setEventStartDate("");
    setEventEndDate("");
  }, [selectedSource]);

  function clearFilters() {
    setSelectedTruck("");
    setSelectedCrew("");
    setSelectedAnnual("");
    setStartDate("");
    setEndDate("");
    setInventoryName("");
    setInventoryCategory("");
    setInventoryStatus("__ACTIVE__");
    setEquipmentName("");
    setEquipmentCategory("");
    setEquipmentStatus("");
    setEquipmentLocation("");
    setEventSearch("");
    setEventType("");
    setEventStartDate("");
    setEventEndDate("");
  }

  function toggleField(field: string) {
    setSelectedFields((current) =>
      current.includes(field)
        ? current.filter((item) => item !== field)
        : [...current, field]
    );
  }

  function exportCsv() {
    if (visibleFields.length === 0 || filteredRecords.length === 0) return;

    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const header = visibleFields.map(escapeCsv).join(",");
    const rows = filteredRecords.map((record) =>
      visibleFields
        .map((field) => escapeCsv(formatValue(record[field])))
        .join(",")
    );
    const csv = "\uFEFF" + [header, ...rows].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const reportName = (source?.label ?? "FireHub Report")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    link.href = url;
    link.download = `${reportName || "firehub-report"}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const buttonStyle = {
    padding: "8px 14px",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    background: "white",
    cursor: "pointer",
  } as const;

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box" as const,
    padding: 10,
    borderRadius: 6,
    border: "1px solid #d1d5db",
    background: "white",
    fontSize: 14,
  };

  return (
    <PageContainer>
      <div style={{ marginBottom: 24 }}>
        <button
          onClick={() => router.push("/")}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            background: "white",
            cursor: "pointer",
          }}
        >
          ← Dashboard
        </button>
      </div>

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700 }}>
          Custom Reports
        </h1>

        <p style={{ color: "#6b7280", marginTop: 8 }}>
          Build reports from information stored in FireHub.
        </p>
      </div>

      <section
        style={{
          background: "white",
          borderRadius: 12,
          padding: 24,
          border: "1px solid #e5e7eb",
          maxWidth: 1200,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <Database size={28} />

          <div>
            <h2 style={{ margin: 0, fontSize: 20 }}>
              Choose a Data Source
            </h2>

            <p style={{ margin: "6px 0 0", color: "#6b7280" }}>
              Each report uses one collection or table.
            </p>
          </div>
        </div>

        <label
          htmlFor="report-source"
          style={{
            display: "block",
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          Database collection or table
        </label>

        <select
          id="report-source"
          value={selectedSource}
          onChange={(event) => setSelectedSource(event.target.value)}
          style={inputStyle}
        >
          <option value="">Select a data source...</option>

          {dataSources.map((item) => (
            <option key={item.collection} value={item.collection}>
              {item.label} ({item.database})
            </option>
          ))}
        </select>

        {source && (
          <div
            style={{
              marginTop: 20,
              padding: 16,
              borderRadius: 8,
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
            }}
          >
            <strong>{source.label}</strong>

            <p style={{ margin: "8px 0 0", color: "#6b7280" }}>
              Database: {source.database}
            </p>

            <p style={{ margin: "4px 0 0", color: "#6b7280" }}>
              Source: {source.collection}
            </p>
          </div>
        )}

        {loading && (
          <p style={{ marginTop: 20 }}>Loading records...</p>
        )}

        {error && (
          <p style={{ marginTop: 20, color: "#dc2626" }}>
            {error}
          </p>
        )}

        {source && !loading && !error && records.length > 0 && (
          <>
            {isEquipmentReport && (
              <div style={{ marginTop: 24, padding: 20, border: "1px solid #e5e7eb", borderRadius: 10, background: "#f9fafb" }}>
                <h3 style={{ fontSize: 18, margin: "0 0 16px" }}>Filter Equipment Inventory</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 16, alignItems: "end" }}>
                  <div><label htmlFor="equipment-name" style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>Equipment Name</label><input id="equipment-name" value={equipmentName} onChange={(event) => setEquipmentName(event.target.value)} placeholder="Search equipment..." style={inputStyle} /></div>
                  <div><label htmlFor="equipment-category" style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>Category</label><select id="equipment-category" value={equipmentCategory} onChange={(event) => setEquipmentCategory(event.target.value)} style={inputStyle}><option value="">All categories</option>{equipmentCategories.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
                  <div><label htmlFor="equipment-status" style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>Status</label><select id="equipment-status" value={equipmentStatus} onChange={(event) => setEquipmentStatus(event.target.value)} style={inputStyle}><option value="">All statuses</option>{equipmentStatuses.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
                  <div><label htmlFor="equipment-location" style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>Location / Assigned To</label><select id="equipment-location" value={equipmentLocation} onChange={(event) => setEquipmentLocation(event.target.value)} style={inputStyle}><option value="">All locations</option>{equipmentLocations.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
                  <div><button type="button" onClick={clearFilters} style={{ ...buttonStyle, width: "100%", padding: 10 }}>Clear Filters</button></div>
                </div>
              </div>
            )}

            {isEventsReport && (
              <div style={{ marginTop: 24, padding: 20, border: "1px solid #e5e7eb", borderRadius: 10, background: "#f9fafb" }}>
                <h3 style={{ fontSize: 18, margin: "0 0 16px" }}>Filter Upcoming Events</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 16, alignItems: "end" }}>
                  <div><label htmlFor="event-search" style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>Search Events</label><input id="event-search" value={eventSearch} onChange={(event) => setEventSearch(event.target.value)} placeholder="Search title, description, location..." style={inputStyle} /></div>
                  <div><label htmlFor="event-type" style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>Event Type</label><select id="event-type" value={eventType} onChange={(event) => setEventType(event.target.value)} style={inputStyle}><option value="">All event types</option>{eventTypes.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
                  <div><label htmlFor="event-start-date" style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>Event Date From</label><input id="event-start-date" type="date" value={eventStartDate} max={eventEndDate || undefined} onChange={(event) => setEventStartDate(event.target.value)} style={inputStyle} /></div>
                  <div><label htmlFor="event-end-date" style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>Event Date To</label><input id="event-end-date" type="date" value={eventEndDate} min={eventStartDate || undefined} onChange={(event) => setEventEndDate(event.target.value)} style={inputStyle} /></div>
                  <div><button type="button" onClick={clearFilters} style={{ ...buttonStyle, width: "100%", padding: 10 }}>Clear Filters</button></div>
                </div>
              </div>
            )}

            {isInventoryReport && (
              <div style={{ marginTop: 24, padding: 20, border: "1px solid #e5e7eb", borderRadius: 10, background: "#f9fafb" }}>
                <h3 style={{ fontSize: 18, margin: "0 0 16px" }}>Filter Maintenance Inventory</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 16, alignItems: "end" }}>
                  <div>
                    <label htmlFor="inventory-name" style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>Item Name</label>
                    <input id="inventory-name" type="text" value={inventoryName} onChange={(event) => setInventoryName(event.target.value)} placeholder="Search item name..." style={inputStyle} />
                  </div>
                  <div>
                    <label htmlFor="inventory-category" style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>Category</label>
                    <select id="inventory-category" value={inventoryCategory} onChange={(event) => setInventoryCategory(event.target.value)} style={inputStyle}>
                      <option value="">All categories</option>
                      {inventoryCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="inventory-status" style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>Status</label>
                    <select id="inventory-status" value={inventoryStatus} onChange={(event) => setInventoryStatus(event.target.value)} style={inputStyle}>
                      <option value="__ACTIVE__">All non-retired items</option>
                      {inventoryStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </div>
                  <div>
                    <button type="button" onClick={clearFilters} style={{ ...buttonStyle, width: "100%", padding: 10 }}>Clear Filters</button>
                  </div>
                </div>
              </div>
            )}

            {hasTruckFilters && (
              <div
                style={{
                  marginTop: 24,
                  padding: 20,
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  background: "#f9fafb",
                }}
              >
                <h3 style={{ fontSize: 18, margin: "0 0 16px" }}>
                  {isMaintenanceReport
                    ? "Filter Maintenance Logs"
                    : isMileageReport
                      ? "Filter Truck Mileage Logs"
                      : "Filter Truck Check Logs"}
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(190px, 1fr))",
                    gap: 16,
                    alignItems: "end",
                  }}
                >
                  <div>
                    <label
                      htmlFor="filter-truck"
                      style={{
                        display: "block",
                        fontWeight: 600,
                        marginBottom: 8,
                      }}
                    >
                      Truck
                    </label>

                    <select
                      id="filter-truck"
                      value={selectedTruck}
                      onChange={(event) =>
                        setSelectedTruck(event.target.value)
                      }
                      style={inputStyle}
                    >
                      <option value="">All trucks</option>

                      {truckNames.map((truck) => (
                        <option key={truck} value={truck}>
                          {truck}
                        </option>
                      ))}
                    </select>
                  </div>

                  {isMaintenanceReport && (
                    <>
                      <div>
                        <label
                          htmlFor="filter-crew"
                          style={{
                            display: "block",
                            fontWeight: 600,
                            marginBottom: 8,
                          }}
                        >
                          Crew
                        </label>

                        <select
                          id="filter-crew"
                          value={selectedCrew}
                          onChange={(event) =>
                            setSelectedCrew(event.target.value)
                          }
                          style={inputStyle}
                        >
                          <option value="">All crews</option>

                          {crewNames.map((crew) => (
                            <option key={crew} value={crew}>
                              {crew}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="filter-annual"
                          style={{
                            display: "block",
                            fontWeight: 600,
                            marginBottom: 8,
                          }}
                        >
                          Annual
                        </label>

                        <select
                          id="filter-annual"
                          value={selectedAnnual}
                          onChange={(event) =>
                            setSelectedAnnual(event.target.value)
                          }
                          style={inputStyle}
                        >
                          <option value="">All annual values</option>

                          {annualOptions.map((annual) => (
                            <option key={annual} value={annual}>
                              {annual}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  <div>
                    <label
                      htmlFor="filter-start-date"
                      style={{
                        display: "block",
                        fontWeight: 600,
                        marginBottom: 8,
                      }}
                    >
                      {isMileageReport
                        ? "Mileage Date From"
                        : "Created From"}
                    </label>

                    <input
                      id="filter-start-date"
                      type="date"
                      value={startDate}
                      max={endDate || undefined}
                      onChange={(event) =>
                        setStartDate(event.target.value)
                      }
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="filter-end-date"
                      style={{
                        display: "block",
                        fontWeight: 600,
                        marginBottom: 8,
                      }}
                    >
                      {isMileageReport
                        ? "Mileage Date To"
                        : "Created To"}
                    </label>

                    <input
                      id="filter-end-date"
                      type="date"
                      value={endDate}
                      min={startDate || undefined}
                      onChange={(event) =>
                        setEndDate(event.target.value)
                      }
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={clearFilters}
                      style={{
                        ...buttonStyle,
                        width: "100%",
                        padding: 10,
                      }}
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div
              style={{
                marginTop: 24,
                padding: 20,
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                background: "#f9fafb",
              }}
            >
              <h3 style={{ fontSize: 18, margin: "0 0 8px" }}>
                Choose Report Columns
              </h3>

              <p style={{ color: "#6b7280", margin: "0 0 16px" }}>
                Select the fields you want to include in your report.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedFields(fields)}
                  style={buttonStyle}
                >
                  Select All
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedFields([])}
                  style={buttonStyle}
                >
                  Clear All
                </button>

                <span style={{ color: "#6b7280", fontSize: 14 }}>
                  {visibleFields.length} of {fields.length} columns selected
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(190px, 1fr))",
                  gap: 10,
                }}
              >
                {fields.map((field) => (
                  <label
                    key={field}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      gap: 10,
                      padding: "12px 14px",
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                      background: "white",
                      cursor: "pointer",
                      minWidth: 0,
                      boxSizing: "border-box",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedFields.includes(field)}
                      onChange={() => toggleField(field)}
                      style={{
                        width: 16,
                        height: 16,
                        flexShrink: 0,
                        margin: 0,
                      }}
                    />

                    <span
                      style={{
                        overflowWrap: "normal",
                        wordBreak: "normal",
                        whiteSpace: "normal",
                        minWidth: 0,
                      }}
                    >
                      {field}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        {source && !loading && !error && (
          <div style={{ marginTop: 24 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
                marginBottom: 12,
              }}
            >
              <h3 style={{ fontSize: 18, margin: 0 }}>
                Report Preview ({filteredRecords.length} records)
              </h3>
              <button
                type="button"
                onClick={exportCsv}
                disabled={filteredRecords.length === 0 || visibleFields.length === 0}
                style={{
                  ...buttonStyle,
                  background: filteredRecords.length === 0 || visibleFields.length === 0 ? "#f3f4f6" : "#ffffff",
                  cursor: filteredRecords.length === 0 || visibleFields.length === 0 ? "not-allowed" : "pointer",
                  opacity: filteredRecords.length === 0 || visibleFields.length === 0 ? 0.6 : 1,
                }}
              >
                Export CSV
              </button>
            </div>

            {filteredRecords.length === 0 ? (
              <p>No records match the selected filters.</p>
            ) : visibleFields.length === 0 ? (
              <p>Select at least one column to preview your report.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 14,
                  }}
                >
                  <thead>
                    <tr>
                      {visibleFields.map((field) => (
                        <th
                          key={field}
                          style={{
                            textAlign: "left",
                            padding: 10,
                            borderBottom: "2px solid #d1d5db",
                            whiteSpace: "nowrap",
                            minWidth:
                              field.toLowerCase() === "bays"
                                ? 500
                                : undefined,
                          }}
                        >
                          {field}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRecords.slice(0, 10).map((record, index) => (
                      <tr key={record.id ?? index}>
                        {visibleFields.map((field) => (
                          <td
                            key={field}
                            style={{
                              padding: 10,
                              borderBottom: "1px solid #e5e7eb",
                              verticalAlign: "top",
                              minWidth:
                                field.toLowerCase() === "bays"
                                  ? 500
                                  : 120,
                              maxWidth:
                                field.toLowerCase() === "bays"
                                  ? 700
                                  : 400,
                              whiteSpace: "pre-wrap",
                              overflowWrap: "anywhere",
                            }}
                          >
                            {formatValue(record[field])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredRecords.length > 10 && (
                  <p style={{ color: "#6b7280", marginTop: 10 }}>
                    Showing the first 10 of {filteredRecords.length} matching records.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </section>
    </PageContainer>
  );
}
