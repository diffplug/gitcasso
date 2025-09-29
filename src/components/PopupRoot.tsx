import { Eye, EyeOff, Search, Settings, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"
import { twMerge } from "tailwind-merge"
import { badgeCVA } from "@/components/design"
import MultiSegment from "@/components/MultiSegment"
import { allLeafValues } from "@/components/misc"
import type { CommentTableRow } from "@/entrypoints/background"
import type { FilterState } from "@/entrypoints/popup/popup"
import { BulkActionsBar } from "./BulkActionsBar"
import { CommentRow } from "./CommentRow"
import { EmptyState } from "./EmptyState"
import { NoMatchesState } from "./NoMatchesState"

const initialFilter: FilterState = {
  searchQuery: "",
  sentFilter: "both",
  showTrashed: false,
}

interface PopupRootProps {
  drafts: CommentTableRow[]
}

export function PopupRoot({ drafts }: PopupRootProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState<FilterState>(initialFilter)

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const filteredDrafts = useMemo(() => {
    let filtered = [...drafts]
    if (!filters.showTrashed) {
      filtered = filtered.filter((d) => !d.isTrashed)
    }
    if (filters.sentFilter !== "both") {
      filtered = filtered.filter((d) =>
        filters.sentFilter === "sent" ? d.isSent : !d.isSent
      )
    }
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter((d) => {
        for (const value of allLeafValues(d)) {
          if (value.toLowerCase().includes(query)) {
            return true // Early exit on first match
          }
        }
        return false
      })
    }
    // sort by newest
    filtered.sort((a, b) => b.latestDraft.time - a.latestDraft.time)
    return filtered
  }, [drafts, filters])

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const toggleSelectAll = () => {
    if (
      selectedIds.size === filteredDrafts.length &&
      filteredDrafts.length > 0
    ) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredDrafts.map((d) => d.spot.unique_key)))
    }
  }

  const handleOpen = (url: string) => {
    window.open(url, "_blank")
  }

  const handleTrash = (row: CommentTableRow) => {
    if (row.latestDraft.stats.charCount > 20) {
      if (confirm("Are you sure you want to discard this draft?")) {
        console.log("Trashing draft:", row.spot.unique_key)
      }
    } else {
      console.log("Trashing draft:", row.spot.unique_key)
    }
  }

  const clearFilters = () => {
    setFilters({
      searchQuery: "",
      sentFilter: "both",
      showTrashed: true,
    })
  }

  const getTableBody = () => {
    if (drafts.length === 0) {
      return <EmptyState />
    }

    if (
      filteredDrafts.length === 0 &&
      (filters.searchQuery || filters.sentFilter !== "both")
    ) {
      return <NoMatchesState onClearFilters={clearFilters} />
    }

    return filteredDrafts.map((row) => (
      <CommentRow
        key={row.spot.unique_key}
        row={row}
        selectedIds={selectedIds}
        toggleSelection={toggleSelection}
        handleOpen={handleOpen}
        handleTrash={handleTrash}
      />
    ))
  }

  return (
    <div className="bg-white">
      {/* Bulk actions bar - floating popup */}
      {selectedIds.size > 0 && <BulkActionsBar selectedIds={selectedIds} />}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-fixed table-fixed">
          <colgroup>
            <col className="w-10" />
            <col />
          </colgroup>
          <thead className="border-gray-400 border-b">
            <tr>
              <th scope="col" className="px-3 py-3">
                <input
                  type="checkbox"
                  checked={
                    selectedIds.size === filteredDrafts.length &&
                    filteredDrafts.length > 0
                  }
                  onChange={toggleSelectAll}
                  aria-label="Select all"
                  className="rounded"
                />
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-left text-gray-500 text-xs"
              >
                <div className="relative">
                  <div className="flex items-center gap-1">
                    <div className="relative flex-1">
                      <Search className="-translate-y-1/2 absolute top-1/2 left-1 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search drafts..."
                        value={filters.searchQuery}
                        onChange={(e) =>
                          updateFilter("searchQuery", e.target.value)
                        }
                        className="h-5 w-full rounded-sm border border-gray-300 pr-3 pl-5 font-normal text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="relative flex gap-1 overflow-hidden">
                      <button
                        type="button"
                        onClick={() =>
                          updateFilter("showTrashed", !filters.showTrashed)
                        }
                        className={twMerge(
                          badgeCVA({
                            clickable: true,
                            type: filters.showTrashed
                              ? "trashed"
                              : "hideTrashed",
                          }),
                          "border"
                        )}
                      >
                        <Trash2 className="h-3 w-3" />
                        {filters.showTrashed ? (
                          <Eye className="h-3 w-3" />
                        ) : (
                          <EyeOff className="h-3 w-3" />
                        )}
                      </button>
                      <MultiSegment<FilterState["sentFilter"]>
                        value={filters.sentFilter}
                        onValueChange={(value) =>
                          updateFilter("sentFilter", value)
                        }
                        segments={[
                          {
                            text: "",
                            type: "unsent",
                            value: "unsent",
                          },
                          {
                            text: "both",
                            type: "blank",
                            value: "both",
                          },
                          {
                            text: "",
                            type: "sent",
                            value: "sent",
                          },
                        ]}
                      />
                      <button
                        type="button"
                        className={twMerge(
                          badgeCVA({
                            clickable: true,
                            type: "settings",
                          }),
                          "border"
                        )}
                      >
                        <Settings className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">{getTableBody()}</tbody>
        </table>
      </div>
    </div>
  )
}
