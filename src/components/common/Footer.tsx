import { FaFacebook, FaLine, FaPhone } from 'react-icons/fa'

const Footer = () => {
  return (
    <footer className="bg-dark-800 border-t border-dark-700 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold gradient-text mb-4">Permchok</h3>
            <p className="text-gray-400 text-sm">
              เว็บแทงหวยและเกมออนไลน์ที่ดีที่สุด จ่ายจริง จ่ายเร็ว
              ฝาก-ถอนออโต้ 24 ชั่วโมง
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">เมนูหลัก</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="text-gray-400 hover:text-primary-500 transition-colors">
                  หน้าแรก
                </a>
              </li>
              <li>
                <a href="/lottery" className="text-gray-400 hover:text-primary-500 transition-colors">
                  แทงหวย
                </a>
              </li>
              <li>
                <a href="/games" className="text-gray-400 hover:text-primary-500 transition-colors">
                  เกมส์
                </a>
              </li>
              <li>
                <a href="/promotions" className="text-gray-400 hover:text-primary-500 transition-colors">
                  โปรโมชั่น
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">ติดต่อเรา</h4>
            <div className="space-y-3">
              <a
                href={import.meta.env.VITE_LINE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-400 hover:text-primary-500 transition-colors text-sm"
              >
                <FaLine className="text-lg" />
                <span>Line: @permchok</span>
              </a>
              <a
                href={import.meta.env.VITE_FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-400 hover:text-primary-500 transition-colors text-sm"
              >
                <FaFacebook className="text-lg" />
                <span>Facebook: Permchok</span>
              </a>
              <a
                href={`tel:${import.meta.env.VITE_SUPPORT_PHONE}`}
                className="flex items-center space-x-2 text-gray-400 hover:text-primary-500 transition-colors text-sm"
              >
                <FaPhone className="text-lg" />
                <span>Tel: {import.meta.env.VITE_SUPPORT_PHONE}</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-dark-700 mt-8 pt-6 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Permchok. All rights reserved.</p>
          <p className="mt-2">เล่นการพนันอย่างมีสติ ห้ามผู้ที่มีอายุต่ำกว่า 18 ปีเข้าเล่น</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
