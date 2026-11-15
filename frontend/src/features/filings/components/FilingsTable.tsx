import { ExternalLink } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Filing } from '../types/filing.types'

type FilingsTableProps = {
  filings: Filing[]
}

export function FilingsTable({ filings }: FilingsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Form</TableHead>
            <TableHead>Filed</TableHead>
            <TableHead>Report date</TableHead>
            <TableHead>Accession</TableHead>
            <TableHead className="text-right">Document</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filings.map((filing) => (
            <TableRow key={filing.accessionNumber}>
              <TableCell className="font-medium">{filing.formType}</TableCell>
              <TableCell>{filing.filingDate}</TableCell>
              <TableCell>{filing.reportDate || '—'}</TableCell>
              <TableCell className="font-mono text-xs">
                {filing.accessionNumber}
              </TableCell>
              <TableCell className="text-right">
                <a
                  href={filing.primaryDocumentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Open
                  <ExternalLink className="size-3.5" aria-hidden />
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
