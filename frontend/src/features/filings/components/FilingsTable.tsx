import { ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { isAllowedSecDocumentUrl } from '@/lib/secUrl'
import type { Filing } from '../types/filing.types'

type FilingsTableProps = {
  filings: Filing[]
}

export function FilingsTable({ filings }: FilingsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border/80">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/60 hover:bg-muted/60">
            <TableHead className="font-semibold">Form</TableHead>
            <TableHead className="font-semibold">Filed</TableHead>
            <TableHead className="font-semibold">Report date</TableHead>
            <TableHead className="font-semibold">Accession</TableHead>
            <TableHead className="text-right font-semibold">Document</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filings.map((filing) => (
            <TableRow
              key={filing.accessionNumber}
              className="hover:bg-accent/40"
            >
              <TableCell>
                <Badge variant="outline">{filing.formType}</Badge>
              </TableCell>
              <TableCell className="text-sm">{filing.filingDate}</TableCell>
              <TableCell className="text-sm">
                {filing.reportDate || '—'}
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {filing.accessionNumber}
              </TableCell>
              <TableCell className="text-right">
                {isAllowedSecDocumentUrl(filing.primaryDocumentUrl) ? (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={filing.primaryDocumentUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Open ${filing.formType} filing ${filing.accessionNumber} on SEC.gov`}
                    >
                      Open
                      <ExternalLink className="size-3.5" aria-hidden />
                    </a>
                  </Button>
                ) : (
                  <span className="text-sm text-muted-foreground">Unavailable</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
