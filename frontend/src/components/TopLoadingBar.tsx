import { motion } from 'framer-motion'

export default function TopLoadingBar() {
  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-[9999] h-[3px] origin-left bg-[#00e676]"
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 0.88 }}
      transition={{ duration: 1.8, ease: 'easeOut' }}
      aria-hidden="true"
    />
  )
}
