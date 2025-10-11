import UserDashboard from "../../components/userDash"
import { Header } from "../../nav/header"
import { Nav } from "../../nav/nav"

export const Admin = () =>{
    return (
        <section className="flex h-screen bg-gray-900">
             <Nav/>
             <main className="flex-1 px-5">
             <Header/>
             <div className="bg-blue-500 text-white py-3 px-10 w-full mt-5 flex justify-between">
                <p>Welcome back, Here is your unique ID: X234566y78u718</p>
                <p>Copy</p>
             </div>
             <table className="w-full table-auto border-collapse border border-gray-800 text-white">
                <thead className="bg-gray-800">
                    <tr>
                        <th className="px-4 py-2">S/N</th>
                        <th>Wallet Adres</th>
                        <th>Accesses</th>
                        <th>Status</th>
                        <th>Action</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th className="px-4 py-2">1</th>
                        <th>X20i8hbh73hh72</th>
                        <th>Facebbok</th>
                        <th>Granted</th>
                        <th className=" flex justify-center p-3">
                            <p className="px-5 py-2 bg-blue-600 text-white rounded-[6px]">Revoke</p>
                        </th>
                        <th>07-10-2025</th>
                    </tr>
                </tbody>
             </table>

            </main>
        </section>
    )
}