import arrow1 from "./arrow-1.svg";
import arrow12 from "./arrow-1-2.svg";
import arrow3 from "./arrow-3.svg";
import ellipse1 from "./ellipse-1.png";
import image from "./image.svg";
import logo from "./logo.svg";
import vector1 from "./vector-1.svg";

const navItems = [
  "Home",
  "Sobre nós",
  "Método",
  "Serviços",
  "Visio Score",
  "FAQ",
  "Contato",
];

export const HeroSection = (): JSX.Element => {
  return (
    <main className="relative w-[1440px] h-[945px] bg-[url(/hero-section.png)] bg-cover bg-[50%_50%] text-white">
      <header className="absolute top-7 left-24 w-[1200px] h-[60px]">
        <div className="flex mt-[1px] h-[41px] w-[1200px] items-center justify-between">
          <a
            href="#home"
            aria-label="VN - Ir para a página inicial"
            className="relative inline-flex"
          >
            <img
              className="relative w-[85.37px] h-[39.33px]"
              alt="VN"
              src={logo}
            />
          </a>
          <div className="inline-flex items-center gap-[29px] relative flex-[0_0_auto]">
            <nav aria-label="Navegação principal">
              <ul className="inline-flex items-center gap-[29px] relative flex-[0_0_auto]">
                {navItems.map((item) => (
                  <li key={item}>
                    <a
                      href={`#${item
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/\s+/g, "-")}`}
                      className="relative block w-fit mt-[-1.00px] font-b2 font-[number:var(--b2-font-weight)] text-white text-[length:var(--b2-font-size)] tracking-[var(--b2-letter-spacing)] leading-[var(--b2-line-height)] whitespace-nowrap [font-style:var(--b2-font-style)]"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <a
              href="#diagnostico"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 relative flex-[0_0_auto] bg-white rounded-lg"
              aria-label="Abrir diagnóstico"
            >
              <span className="relative w-fit mt-[-1.00px] font-b2 font-[number:var(--b2-font-weight)] text-black text-[length:var(--b2-font-size)] tracking-[var(--b2-letter-spacing)] leading-[var(--b2-line-height)] whitespace-nowrap [font-style:var(--b2-font-style)]">
                Diagnóstico
              </span>
              <img
                className="relative w-[10.68px] h-[11.29px] mr-[-0.68px]"
                alt=""
                aria-hidden="true"
                src={arrow1}
              />
            </a>
          </div>
        </div>
      </header>
      <section
        className="inline-flex flex-col items-start justify-center gap-9 absolute top-[342px] left-24"
        aria-labelledby="hero-heading"
      >
        <h1
          id="hero-heading"
          className="relative w-[616px] mt-[-1.00px] font-h2 font-[number:var(--h2-font-weight)] text-transparent text-[length:var(--h2-font-size)] tracking-[var(--h2-letter-spacing)] leading-[var(--h2-line-height)] [font-style:var(--h2-font-style)]"
        >
          <span className="text-[#b8975a] tracking-[var(--h2-letter-spacing)] font-h2 [font-style:var(--h2-font-style)] font-[number:var(--h2-font-weight)] leading-[var(--h2-line-height)] text-[length:var(--h2-font-size)]">
            Não fazemos campanhas
          </span>
          <span className="text-white tracking-[var(--h2-letter-spacing)] font-h2 [font-style:var(--h2-font-style)] font-[number:var(--h2-font-weight)] leading-[var(--h2-line-height)] text-[length:var(--h2-font-size)]">
            .<br />
            Construímos a fundação da sua percepção.
          </span>
        </h1>
        <p className="relative w-[589.43px] font-h5 font-[number:var(--h5-font-weight)] text-white text-[length:var(--h5-font-size)] tracking-[var(--h5-letter-spacing)] leading-[var(--h5-line-height)] [font-style:var(--h5-font-style)]">
          Ajudamos PMEs angolanas a transformar percepção numa vantagem
          estratégica mensurável — através do Visio Method™.
        </p>
      </section>
      <div className="absolute top-[621px] left-24 w-[266px] h-[41px] flex gap-[25.5px]">
        <a
          href="#diagnostico"
          className="inline-flex h-[41px] items-center justify-center gap-2 px-4 py-2 relative w-[135.5px] bg-white rounded-lg"
          aria-label="Ir para diagnóstico"
        >
          <span className="relative w-fit mt-[-1.00px] font-b2 font-[number:var(--b2-font-weight)] text-black text-[length:var(--b2-font-size)] tracking-[var(--b2-letter-spacing)] leading-[var(--b2-line-height)] whitespace-nowrap [font-style:var(--b2-font-style)]">
            Diagnóstico
          </span>
          <img
            className="relative w-[10.68px] h-[11.29px] mr-[-0.68px]"
            alt=""
            aria-hidden="true"
            src={arrow12}
          />
        </a>
        <a
          href="#metodo"
          className="inline-flex h-[41px] w-[105.5px] items-center justify-center gap-2 px-4 py-2 rounded-lg border border-solid border-p-3 relative"
          aria-label="Ir para método"
        >
          <span className="relative w-fit mt-[-1.00px] font-b2 font-[number:var(--b2-font-weight)] text-white text-[length:var(--b2-font-size)] tracking-[var(--b2-letter-spacing)] leading-[var(--b2-line-height)] whitespace-nowrap [font-style:var(--b2-font-style)]">
            Método
          </span>
          <img
            className="relative w-[10.68px] h-[11.29px] mr-[-0.68px]"
            alt=""
            aria-hidden="true"
            src={image}
          />
        </a>
      </div>
      <aside
        className="absolute w-[379px] h-[422px] top-80 left-[916px]"
        aria-label="Informações em destaque"
      >
        <article className="absolute top-0 left-0 w-[391px] h-[279px]">
          <img
            className="absolute top-0 left-0 w-[380px] h-[280px] backdrop-blur-[17.5px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(17.5px)_brightness(100%)]"
            alt=""
            aria-hidden="true"
            src={vector1}
          />
          <div className="absolute top-3 left-4 font-b4 font-[number:var(--b4-font-weight)] text-white text-[length:var(--b4-font-size)] tracking-[var(--b4-letter-spacing)] leading-[var(--b4-line-height)] whitespace-nowrap [font-style:var(--b4-font-style)]">
            Aproximadamente
          </div>
          <p className="absolute top-8 left-4 [font-family:'Manrope-Bold',Helvetica] font-normal text-transparent text-[32px] tracking-[-0.64px] leading-8">
            <span className="font-[number:var(--h3-font-weight)] text-[#e8e4f5] tracking-[var(--h3-letter-spacing)] leading-[var(--h3-line-height)] font-h3 [font-style:var(--h3-font-style)] text-[length:var(--h3-font-size)]">
              1 em 4
            </span>
            <span className="font-b2 text-black text-[length:var(--b2-font-size)] tracking-[var(--b2-letter-spacing)] leading-[var(--b2-line-height)] [font-style:var(--b2-font-style)] font-[number:var(--b2-font-weight)]">
              &nbsp;
            </span>
            <span className="font-b2 text-white text-[length:var(--b2-font-size)] tracking-[var(--b2-letter-spacing)] leading-[var(--b2-line-height)] [font-style:var(--b2-font-style)] font-[number:var(--b2-font-weight)]">
              PMEs em Angola
            </span>
          </p>
          <p className="absolute top-[74px] left-4 w-[347px] font-b4 font-[number:var(--b4-font-weight)] text-white text-[length:var(--b4-font-size)] tracking-[var(--b4-letter-spacing)] leading-[var(--b4-line-height)] [font-style:var(--b4-font-style)]">
            É quanto das empresas registadas em Angola continua activa hoje. A
            diferença raramente é o produto — é como o mercado as vê.
          </p>
          <div className="absolute top-[178px] left-4 font-h3 font-[number:var(--h3-font-weight)] text-s-3 text-[length:var(--h3-font-size)] tracking-[var(--h3-letter-spacing)] leading-[var(--h3-line-height)] whitespace-nowrap [font-style:var(--h3-font-style)]">
            0-100
          </div>
          <div className="top-[196px] left-[104px] w-[59px] text-e-4 text-[length:var(--b4-font-size)] tracking-[var(--b4-letter-spacing)] leading-[var(--b4-line-height)] absolute font-b4 font-[number:var(--b4-font-weight)] [font-style:var(--b4-font-style)]">
            Visio Score
          </div>
          <p className="absolute top-[220px] left-4 w-44 font-b4 font-[number:var(--b4-font-weight)] text-white text-[length:var(--b4-font-size)] tracking-[var(--b4-letter-spacing)] leading-[var(--b4-line-height)] [font-style:var(--b4-font-style)]">
            Uma escala que transforma &quot;parece-me melhor&quot; em algo que
            se mede, compara e melhora.
          </p>
        </article>
        <article className="absolute top-44 left-[217px] w-[174px] h-[103px]">
          <div className="w-[162px] h-[103px] bg-white absolute top-0 left-0 rounded-2xl" />
          <div className="top-[13px] left-[13px] text-black text-sm tracking-[-0.28px] leading-[21px] whitespace-nowrap absolute [font-family:'Manrope-Regular',Helvetica] font-normal">
            Visio Score
          </div>
          <div className="absolute top-[34px] left-[13px] [font-family:'Manrope-Regular',Helvetica] font-normal text-black text-[10px] tracking-[-0.20px] leading-[10px] whitespace-nowrap">
            Antes
          </div>
          <div className="absolute top-[34px] left-[81px] [font-family:'Manrope-Regular',Helvetica] font-normal text-black text-[10px] tracking-[-0.20px] leading-[10px] whitespace-nowrap">
            Depois
          </div>
          <div className="left-[13px] absolute top-[49px] font-b3 font-[number:var(--b3-font-weight)] text-black text-[length:var(--b3-font-size)] tracking-[var(--b3-letter-spacing)] leading-[var(--b3-line-height)] whitespace-nowrap [font-style:var(--b3-font-style)]">
            45 pts
          </div>
          <img
            className="absolute top-[57px] left-[61px] w-2.5 h-[7px] object-cover"
            alt=""
            aria-hidden="true"
            src={arrow3}
          />
          <div className="left-[81px] absolute top-[49px] font-b3 font-[number:var(--b3-font-weight)] text-black text-[length:var(--b3-font-size)] tracking-[var(--b3-letter-spacing)] leading-[var(--b3-line-height)] whitespace-nowrap [font-style:var(--b3-font-style)]">
            80 pts
          </div>
          <div className="absolute top-[76px] left-6 font-b4 font-[number:var(--b4-font-weight)] text-p-2 text-[length:var(--b4-font-size)] tracking-[var(--b4-letter-spacing)] leading-[var(--b4-line-height)] whitespace-nowrap [font-style:var(--b4-font-style)]">
            + 35 pts
          </div>
          <div className="absolute top-[81px] left-3.5 w-[7px] h-[7px] bg-s-2 rounded-[3.5px]" />
        </article>
        <article className="absolute top-72 left-px w-96 h-[134px]">
          <div className="w-[378px] h-[134px] bg-[#d4d4d41a] border-[none] backdrop-blur-[17.5px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(17.5px)_brightness(100%)] absolute top-0 left-0 rounded-2xl before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-2xl before:[background:linear-gradient(263deg,rgba(184,151,90,0.5)_0%,rgba(102,102,102,0)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none" />
          <img
            className="absolute top-[15px] left-[15px] w-[39px] h-[39px]"
            alt="Jeff Bezos"
            src={ellipse1}
          />
          <div className="absolute top-[11px] left-[62px] font-b2 font-[number:var(--b2-font-weight)] text-white text-[length:var(--b2-font-size)] tracking-[var(--b2-letter-spacing)] leading-[var(--b2-line-height)] whitespace-nowrap [font-style:var(--b2-font-style)]">
            Jeff Bezos
          </div>
          <div className="absolute top-[35px] left-[62px] font-b4 font-[number:var(--b4-font-weight)] text-white text-[length:var(--b4-font-size)] tracking-[var(--b4-letter-spacing)] leading-[var(--b4-line-height)] whitespace-nowrap [font-style:var(--b4-font-style)]">
            Fundador da Amazon
          </div>
          <p className="absolute top-[71px] left-[15px] w-[345px] font-b4 font-[number:var(--b4-font-weight)] text-white text-[length:var(--b4-font-size)] tracking-[var(--b4-letter-spacing)] leading-[var(--b4-line-height)] [font-style:var(--b4-font-style)]">
            &quot;Sua marca é o que as pessoas falam de você quando você não
            está na sala.&quot;
          </p>
        </article>
      </aside>
    </main>
  );
};
