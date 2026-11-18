export function rupiah(n: number) {
  return 'Rp ' + Math.round(n).toLocaleString('id-ID')
}

export function kg(n: number) {
  return `${Number.isInteger(n) ? n : n.toFixed(1)} kg`
}
