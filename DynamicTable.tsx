
import React, { useState, useMemo } from 'react';
import { SectionData, TableColumn, TableRow } from '../types';
import { Plus, Trash2, Edit3, Save, ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';

interface DynamicTableProps {
  data: SectionData;
  onChange: (newData: SectionData) => void;
  readOnly?: boolean;
}

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc' | null;
};

const DynamicTable: React.FC<DynamicTableProps> = ({ data, onChange, readOnly }) => {
  const [editingColId, setEditingColId] = useState<string | null>(null);
  const [tempColName, setTempColName] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: null });

  const addColumn = () => {
    const newCol: TableColumn = {
      id: Math.random().toString(36).substring(7),
      header: 'New Column'
    };
    onChange({
      ...data,
      columns: [...data.columns, newCol]
    });
  };

  const addRow = () => {
    const newRow: TableRow = {
      id: Math.random().toString(36).substring(7),
      values: {}
    };
    onChange({
      ...data,
      rows: [...data.rows, newRow]
    });
  };

  const updateCellValue = (rowId: string, colId: string, value: string) => {
    const newRows = data.rows.map(row => {
      if (row.id === rowId) {
        return { ...row, values: { ...row.values, [colId]: value } };
      }
      return row;
    });
    onChange({ ...data, rows: newRows });
  };

  const startEditColumn = (e: React.MouseEvent, col: TableColumn) => {
    e.stopPropagation();
    setEditingColId(col.id);
    setTempColName(col.header);
  };

  const saveColumnName = () => {
    if (editingColId) {
      const newCols = data.columns.map(c => 
        c.id === editingColId ? { ...c, header: tempColName } : c
      );
      onChange({ ...data, columns: newCols });
      setEditingColId(null);
    }
  };

  const deleteColumn = (e: React.MouseEvent, colId: string) => {
    e.stopPropagation();
    const newCols = data.columns.filter(c => c.id !== colId);
    const newRows = data.rows.map(row => {
      const newValues = { ...row.values };
      delete newValues[colId];
      return { ...row, values: newValues };
    });
    onChange({ columns: newCols, rows: newRows });
  };

  const deleteRow = (rowId: string) => {
    onChange({ ...data, rows: data.rows.filter(r => r.id !== rowId) });
  };

  const handleSort = (colId: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortConfig.key === colId && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === colId && sortConfig.direction === 'desc') {
      direction = null;
    }
    setSortConfig({ key: colId, direction });
  };

  const sortedRows = useMemo(() => {
    if (!sortConfig.direction) return data.rows;
    return [...data.rows].sort((a, b) => {
      const valA = (a.values[sortConfig.key] || '').toLowerCase();
      const valB = (b.values[sortConfig.key] || '').toLowerCase();
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data.rows, sortConfig]);

  return (
    <div className="w-full overflow-hidden">
      <div className="overflow-x-auto no-scrollbar pb-4">
        <table className="min-w-full divide-y divide-slate-200 border rounded-lg bg-white shadow-sm">
          <thead className="bg-slate-50">
            <tr>
              {data.columns.map(col => (
                <th 
                  key={col.id} 
                  onClick={() => !editingColId && handleSort(col.id)}
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider min-w-[150px] relative group cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  {editingColId === col.id ? (
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <input 
                        className="border rounded px-1 py-0.5 w-full text-slate-900 font-normal normal-case"
                        value={tempColName}
                        onChange={(e) => setTempColName(e.target.value)}
                        autoFocus
                      />
                      <button onClick={saveColumnName} className="text-green-600"><Save size={14}/></button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{col.header}</span>
                        {sortConfig.key === col.id ? (
                          sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        ) : (
                          <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-40" />
                        )}
                      </div>
                      {!readOnly && (
                        <div className="hidden group-hover:flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          <button onClick={(e) => startEditColumn(e, col)} className="text-slate-400 hover:text-slate-600"><Edit3 size={12}/></button>
                          <button onClick={(e) => deleteColumn(e, col.id)} className="text-red-400 hover:text-red-600"><Trash2 size={12}/></button>
                        </div>
                      )}
                    </div>
                  )}
                </th>
              ))}
              {!readOnly && (
                <th className="px-4 py-3 w-10">
                  <button 
                    onClick={addColumn}
                    className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                    title="Add Column"
                  >
                    <Plus size={16} />
                  </button>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {sortedRows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                {data.columns.map(col => (
                  <td key={col.id} className="px-4 py-2">
                    <input 
                      type="text"
                      className={`w-full bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none py-1 transition-all ${readOnly ? 'cursor-default' : ''}`}
                      value={row.values[col.id] || ''}
                      onChange={(e) => updateCellValue(row.id, col.id, e.target.value)}
                      readOnly={readOnly}
                      placeholder={readOnly ? '' : '...'}
                    />
                  </td>
                ))}
                {!readOnly && (
                  <td className="px-4 py-2 text-right">
                    <button 
                      onClick={() => deleteRow(row.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {!readOnly && (
        <button 
          onClick={addRow}
          className="mt-3 flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          <Plus size={16} /> Add Row
        </button>
      )}
    </div>
  );
};

export default DynamicTable;
