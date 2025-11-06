import React, { useState } from 'react'
import { FaKeyboard, FaThList } from 'react-icons/fa'
import { FiCheck, FiX, FiSearch } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { BET_TYPES, generateNumberGrid, filterNumbers } from '@/utils/lotteryHelpers'
import { CartItem } from '@/hooks/useLotteryState'

interface InputModeSectionProps {
  inputMode: 'keyboard' | 'grid'
  setInputMode: (mode: 'keyboard' | 'grid') => void
  selectedBetType: string
  numberInput: string
  setNumberInput: (input: string) => void
  onAddNumber: (number: string) => void
  cart: CartItem[]
  searchQuery: string
  setSearchQuery: (query: string) => void
}

const InputModeSection: React.FC<InputModeSectionProps> = ({
  inputMode,
  setInputMode,
  selectedBetType,
  numberInput,
  setNumberInput,
  onAddNumber,
  cart,
  searchQuery,
  setSearchQuery
}) => {
  const currentConfig = BET_TYPES[selectedBetType]

  return (
    <div className="backdrop-blur-md bg-white/10 rounded-2xl border-2 border-white/20 shadow-2xl overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b-2 border-white/20">
        <button
          onClick={() => setInputMode('keyboard')}
          className={`
            flex-1 py-4 px-6 font-bold flex items-center justify-center gap-2 transition-all
            ${inputMode === 'keyboard'
              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
              : 'bg-white/5 text-white/60 hover:bg-white/10'
            }
          `}
        >
          <FaKeyboard className="text-xl" />
          คีย์เลขเอง
        </button>
        <button
          onClick={() => setInputMode('grid')}
          className={`
            flex-1 py-4 px-6 font-bold flex items-center justify-center gap-2 transition-all
            ${inputMode === 'grid'
              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
              : 'bg-white/5 text-white/60 hover:bg-white/10'
            }
          `}
        >
          <FaThList className="text-xl" />
          เลือกจากแผง
        </button>
      </div>

      <div className="p-3">
        <AnimatePresence mode="wait">
          {inputMode === 'keyboard' ? (
            <KeyboardMode
              key="keyboard"
              currentConfig={currentConfig}
              numberInput={numberInput}
              setNumberInput={setNumberInput}
              onAddNumber={onAddNumber}
            />
          ) : (
            <GridMode
              key="grid"
              currentConfig={currentConfig}
              selectedBetType={selectedBetType}
              cart={cart}
              onAddNumber={onAddNumber}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/**
 * Keyboard Mode Component
 */
interface KeyboardModeProps {
  currentConfig: typeof BET_TYPES[keyof typeof BET_TYPES]
  numberInput: string
  setNumberInput: (input: string) => void
  onAddNumber: (number: string) => void
}

const KeyboardMode: React.FC<KeyboardModeProps> = ({
  currentConfig,
  numberInput,
  setNumberInput,
  onAddNumber
}) => {
  const handleNumberClick = (digit: string) => {
    if (numberInput.length < currentConfig.digitCount) {
      setNumberInput(numberInput + digit)
    }
  }

  const handleBackspace = () => {
    setNumberInput(numberInput.slice(0, -1))
  }

  const handleClear = () => {
    setNumberInput('')
  }

  const handleAdd = () => {
    if (numberInput.length === currentConfig.digitCount) {
      onAddNumber(numberInput)
      setNumberInput('')
    }
  }

  // Display value with placeholders
  const displayValue = numberInput.padEnd(currentConfig.digitCount, '-')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Number Display */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-center border-2 border-white/30 shadow-xl">
        <div className="text-white/70 text-sm mb-2">
          ระบุตัวเลข
        </div>
        <div className="text-5xl font-bold text-yellow-300 tracking-wider min-h-[60px] flex items-center justify-center font-mono">
          {displayValue}
        </div>
      </div>

      {/* Numpad */}
      <div className="grid grid-cols-4 gap-3">
        {[1, 2, 3, 'back', 4, 5, 6, 'clear', 7, 8, 9, 'add', '', 0, '', ''].map((btn, idx) => {
          if (btn === '') return <div key={idx}></div>

          if (btn === 'back') {
            return (
              <motion.button
                key={btn}
                onClick={handleBackspace}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl p-6 font-bold text-lg transition-all transform shadow-lg"
              >
                <FiX className="text-2xl mx-auto" />
              </motion.button>
            )
          }

          if (btn === 'clear') {
            return (
              <motion.button
                key={btn}
                onClick={handleClear}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-600 hover:bg-gray-700 text-white rounded-xl p-6 font-bold text-sm transition-all transform shadow-lg"
              >
                ล้าง
              </motion.button>
            )
          }

          if (btn === 'add') {
            return (
              <motion.button
                key={btn}
                onClick={handleAdd}
                disabled={numberInput.length !== currentConfig.digitCount}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl p-6 font-bold text-lg transition-all transform shadow-lg disabled:opacity-50"
              >
                <FiCheck className="text-2xl mx-auto" />
              </motion.button>
            )
          }

          return (
            <motion.button
              key={btn}
              onClick={() => handleNumberClick(btn.toString())}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl p-6 font-bold text-3xl transition-all transform shadow-lg"
            >
              {btn}
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}

/**
 * Grid Mode Component
 */
interface GridModeProps {
  currentConfig: typeof BET_TYPES[keyof typeof BET_TYPES]
  selectedBetType: string
  cart: CartItem[]
  onAddNumber: (number: string) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
}

const GridMode: React.FC<GridModeProps> = ({
  currentConfig,
  selectedBetType,
  cart,
  onAddNumber,
  searchQuery,
  setSearchQuery
}) => {
  const [activeRange, setActiveRange] = useState('000')

  const allNumbers = generateNumberGrid(currentConfig.digitCount)

  // Generate range tabs based on digit count
  const generateRangeTabs = () => {
    if (currentConfig.digitCount === 4) {
      return ['0000', '1000', '2000', '3000', '4000', '5000', '6000', '7000', '8000', '9000']
    } else if (currentConfig.digitCount === 3) {
      return ['000', '100', '200', '300', '400', '500', '600', '700', '800', '900']
    } else {
      return [] // No range tabs for 1-2 digits
    }
  }

  const rangeTabs = generateRangeTabs()

  // Filter numbers by search or active range
  const getFilteredNumbers = () => {
    if (searchQuery) {
      return filterNumbers(allNumbers, searchQuery)
    }
    // For 1-2 digits, show all numbers (no range filtering)
    if (currentConfig.digitCount <= 2) {
      return allNumbers
    }
    // Filter by range (e.g., '000' shows 000-099)
    return allNumbers.filter(num => num.startsWith(activeRange[0]))
  }

  const displayNumbers = getFilteredNumbers()

  const isInCart = (number: string) => {
    return cart.some(item => item.number === number && item.bet_type === selectedBetType)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-3"
    >
      {/* Search */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาเลข..."
            className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/50 focus:outline-none focus:border-yellow-400 transition-colors"
          />
        </div>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            ล้าง
          </button>
        )}
      </div>

      {/* Range Tabs - Only show for 3-4 digits and when not searching */}
      {!searchQuery && currentConfig.digitCount >= 3 && rangeTabs.length > 0 && (
        <div className="flex gap-1 overflow-x-auto pb-1 custom-scrollbar">
          {rangeTabs.map(range => (
            <button
              key={range}
              onClick={() => setActiveRange(range)}
              className={`
                flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-bold transition-all border
                ${activeRange === range
                  ? 'bg-yellow-500 text-gray-900 border-yellow-400'
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                }
              `}
            >
              {range}
            </button>
          ))}
        </div>
      )}

      {/* Number Grid */}
      <div className="bg-white/5 rounded-lg p-2 max-h-[450px] overflow-y-auto custom-scrollbar">
        {displayNumbers.length === 0 ? (
          <div className="text-center py-8 text-white/50">
            <FiSearch className="text-4xl mx-auto mb-2 opacity-50" />
            <p className="text-sm">ไม่พบเลขที่ค้นหา</p>
          </div>
        ) : (
          <div className={`grid gap-1 ${
            currentConfig.digitCount >= 3
              ? 'grid-cols-5 sm:grid-cols-10'
              : 'grid-cols-10'
          }`}>
            {displayNumbers.map(number => {
              const inCart = isInCart(number)

              return (
                <button
                  key={number}
                  onClick={() => !inCart && onAddNumber(number)}
                  disabled={inCart}
                  className={`
                    py-2 rounded text-sm font-bold transition-all
                    ${inCart
                      ? 'bg-green-600 text-white cursor-not-allowed opacity-70'
                      : 'bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow cursor-pointer active:scale-95'
                    }
                  `}
                >
                  {number}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default InputModeSection
