import GymCarousel from "../../components/GymCarrusel";
import GymCarouselA from "../../components/GymCarruselA";

const HomePage = () => {
  return (
    <div className="pa4">
      <h1 className="f2">Bienvenido a AppGymHub</h1>
      <p className="lh-copy measure">
        Tu lugar para acceder a los mejores gimnasios y estudios
        de bienestar.
      </p>
      <div className="mt-6">
        {/* <GymCarousel /> */}
        <GymCarouselA />
      </div>
    </div>
  );
};

export default HomePage;
