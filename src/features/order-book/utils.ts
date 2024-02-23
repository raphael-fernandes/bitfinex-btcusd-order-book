const setLocale = (num: number, withOpts = true, locale = "en-US"): string => {
  if (!withOpts) {
    return num.toLocaleString(locale)
  }

  const opts: Intl.NumberFormatOptions = {
    notation: "compact",
    compactDisplay: "short",
  }

  if (num < 1) {
    opts.minimumFractionDigits = 4
    opts.maximumFractionDigits = 4
  } else {
    opts.minimumSignificantDigits = 4
    opts.maximumSignificantDigits = 4
  }

  return num.toLocaleString(locale, opts)
}

const sortArrayDesc = (arr: number[]) => [...arr].sort((a, b) => b - a)

const sortArrayAsc = (arr: number[]) => [...arr].sort((a, b) => a - b)

export { setLocale, sortArrayDesc, sortArrayAsc }
