import GymCarousel from "../../components/GymCarrusel";
import GymCarouselA from "../../components/GymCarruselA";

const HomePage = () => {
  return (
    <div className="pa4">
      <h1 className="f2">Bienvenido a GymHub</h1>
      <p className="lh-copy measure">
        Tu lugar para acceder a los mejores gimnasios y actividades para tu
        bienestar.
      </p>
      <div className="mt-6">
        {/* <GymCarousel /> */}
        <GymCarouselA />
      </div>
    </div>
  );
};

export default HomePage;
