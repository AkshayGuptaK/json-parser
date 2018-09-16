function valueParser (input) {
  input = input.replace(/ /g, '') // removes all whitespace from input
  let returned = null
  let value
  const parsers = [nullParser, booleanParser, numberParser, stringParser, arrayParser, objectParser]

  for (let parserFunction of parsers) {
    returned = parserFunction(input)
    if (returned != null) {
      [value, input] = returned
      break
    }
  }
  if (returned === null) {
    throw new TypeError()
  } else if (input === '') {
    return [value, input]
  } else {
    throw new TypeError()
  }
}

function nullParser (input) {
  if (input.startsWith('null')) {
    return [null, input.slice(4)]
  } else {
    return null
  }
}

function booleanParser (input) {
  if (input.startsWith('true')) {
    return [true, input.slice(4)]
  } else if (input.startsWith('false')) {
    return [false, input.slice(5)]
  } else {
    return null
  }
}

function processNumber (numberString) {
  let sign = 1
  let number = 0
  let length = 0

  if (/-/.test(numberString)) {
    sign = -1
  } numberString = /\d+/.exec(numberString)[0]
  for (let digit of numberString) {
    digit = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].indexOf(digit)
    number = number * 10 + digit
    length++
  } return [sign, number, length]
}

function numberParser (input) {
  let sign = 1
  let exponentSign = 1
  let number = 0
  let decimal = 0
  let exponent = 0
  let length = 0

  let result = /^(-?(0|\d+))([.]\d+)?([Ee][+-]?\d+)?/.exec(input)
  if (result === null) {
    return null
  } else {
    [sign, number, length] = processNumber(result[2])
    if (result[3] !== undefined) {
      [exponentSign, decimal, length] = processNumber(result[3])
      number += decimal / Math.pow(10, length)
    }
    if (result[4] !== undefined) {
      [exponentSign, exponent, length] = processNumber(result[4])
      number *= Math.pow(10, exponentSign * exponent)
    }
    number *= sign
    return [number, input.slice(result[0].length)]
  }
}

function stringParser (input) {
  let result = /^"([^"\\]|\\["/\\bfnrt]|\\u[a-fA-F0-9]{4})*"/.exec(input)
  if (result === null) {
    return null
  }
  return [result[0].replace(/"/g, ''), input.slice(result[0].length)]
}

function arrayParser (input) {
  let permittingEnd = true
  let requiringEnd = false
  let processString = input
  let result = []
  let value

  if (processString[0] !== '[') {
    return null
  } processString = processString.replace('[', '')
  while (processString[0] !== ']') {
    if (requiringEnd) {
      throw new TypeError()
    }
    [value, processString] = valueParser(processString)
    result.push(value)
    if (processString[0] === ',') {
      processString = processString.replace(',', '')
      permittingEnd = false
      requiringEnd = false
    } else {
      permittingEnd = true
      requiringEnd = true
    }
  } if (permittingEnd === false) {
    throw new TypeError()
  }
  return [result, processString.replace(']', '')]
}

function objectParser (input) {
  let permittingEnd = true
  let requiringEnd = false
  let processString = input
  let result = {}
  let key = ''
  let value

  if (processString[0] !== '{') {
    return null
  }
  processString = processString.replace('{', '')

  while (processString[0] !== '}') {
    if (requiringEnd) {
      throw new TypeError()
    }
    [key, processString] = stringParser(processString)
    if (processString[0] === ':') {
      processString = processString.replace(':', '')
    } else {
      throw new TypeError()
    }
    [value, processString] = valueParser(processString)
    result[key] = value
    if (processString[0] === ',') {
      processString = processString.replace(',', '')
      permittingEnd = false
      requiringEnd = false
    } else {
      requiringEnd = true
      permittingEnd = true
    }
  } if (permittingEnd === false) {
    throw new TypeError()
  }
  return [result, processString.replace('}', '')]
}
