import React from "react";

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({
  className = "",
  children,
  ...props
}) => (
  <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
    <div className="overflow-x-auto">
      <table className={["w-full text-left text-sm", className].join(" ")} {...props}>
        {children}
      </table>
    </div>
  </div>
);

export const THead: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className = "",
  children,
  ...props
}) => (
  <thead className={["bg-gray-50 text-gray-700", className].join(" ")} {...props}>
    {children}
  </thead>
);

export const TBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className = "",
  children,
  ...props
}) => <tbody className={className} {...props}>{children}</tbody>;

export const TR: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  className = "",
  children,
  ...props
}) => (
  <tr className={["border-b last:border-0", className].join(" ")} {...props}>
    {children}
  </tr>
);

export const TH: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  className = "",
  children,
  ...props
}) => (
  <th className={["p-3 text-xs font-semibold uppercase tracking-wide", className].join(" ")} {...props}>
    {children}
  </th>
);

export const TD: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  className = "",
  children,
  ...props
}) => (
  <td className={["p-3 align-middle", className].join(" ")} {...props}>
    {children}
  </td>
);

export default Table;


