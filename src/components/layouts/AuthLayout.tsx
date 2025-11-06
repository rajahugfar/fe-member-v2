import { Outlet } from 'react-router-dom'

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-pattern p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Permchok</h1>
          <p className="text-gray-400">เว็บแทงหวยและเกมออนไลน์</p>
        </div>
        <Outlet />
      </div>
    </div>
  )
}

export default AuthLayout
