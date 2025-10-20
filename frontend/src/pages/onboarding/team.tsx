import Jamil from "../../assets/jamil.jpg";
import Mataya from "../../assets/matayas.jpg";
import Haleemah from "../../assets/haleemah.jpg";
import Yakub from "../../assets/yakub.jpg";

export const Team = () => {
  const Teams = [
    {
      id: 1,
      name: "Mathias Oluwatoyin",
      role: "| Project Lead | Coordination, project management & hackathon submission |",
      img: Mataya,
    },
    {
      id: 2,
      name: "Babatunde Jamiu",
      role: "| UI/UX Designer | Figma design & user flow design |",
      img: Jamil,
    },
    {
      id: 3,
      name: "Yakub Shakirudeen Olaide",
      role: "| Fullstack Developer | Smart contract, backend logic & encryption integration |",
      img: Yakub,
    },
    {
      id: 4,
      name: "Sulyman Haleemah",
      role: "| UI/UX Designer | Component styling & user experience refinement |",
      img: Haleemah,
    },
  ];

  return (
    <section className="w-full py-16 bg-black">
      <div className="text-center mb-10 px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-white">Our Team</h2>
        <p className="text-gray-600 mt-2 text-lg">
          Meet the brilliant minds behind <span className="font-semibold text-indigo-600">Quebec</span>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-6 md:px-20">
        {Teams.map((team) => (
          <div
            key={team.id}
            className="flex flex-col items-center bg-[#000306] rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6"
          >
            <img
              src={team.img}
              alt={team.name}
              className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-indigo-100 mb-4"
            />
            <h3 className="text-lg font-semibold text-white text-center">{team.name}</h3>
            <p className="text-sm text-gray-600 text-center mt-2">{team.role}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
