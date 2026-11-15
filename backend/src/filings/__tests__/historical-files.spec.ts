import {
  fileOverlapsRange,
  selectOverlappingHistoricalFiles,
} from '../utils/historical-files';

describe('historical-files', () => {
  const files = [
    {
      name: 'older.json',
      filingFrom: '2010-01-01',
      filingTo: '2015-12-31',
    },
    {
      name: 'newer.json',
      filingFrom: '2016-01-01',
      filingTo: '2019-12-31',
    },
  ];

  it('detects overlapping historical file ranges', () => {
    expect(fileOverlapsRange(files[0], '2015-01-01', '2015-06-01')).toBe(true);
    expect(fileOverlapsRange(files[1], '2010-01-01', '2012-01-01')).toBe(false);
  });

  it('selects overlapping historical files', () => {
    expect(
      selectOverlappingHistoricalFiles(files, '2015-01-01', '2015-12-31').map(
        (file) => file.name,
      ),
    ).toEqual(['older.json']);
  });
});
