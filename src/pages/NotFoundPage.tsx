import { Link } from 'react-router-dom'
import { FaHome } from 'react-icons/fa'

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-pattern">
      <div className="text-center">
        <h1 className="text-9xl font-bold gradient-text mb-4">404</h1>
        <p className="text-2xl text-gray-400 mb-8">ไม่พบหน้าที่คุณต้องการ</p>
        <Link to="/" className="btn btn-primary inline-flex items-center gap-2">
          <FaHome />
          กลับหน้าแรก
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
