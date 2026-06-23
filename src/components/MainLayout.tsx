import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import MagneticWrapper from "./MagneticWrapper";
import Lenis from "lenis";
import {
  playTick,
  playChime,
  playSuccess,
  startZenDrone,
  stopZenDrone,
} from "../utils/audio";

const HeroCanvas = lazy(() => import("./HeroCanvas"));
const EquipmentCanvas = lazy(() => import("./EquipmentCanvas"));

gsap.registerPlugin(ScrollTrigger);

const productInfoMap: Record<string, any> = {
  "Ethiopian Yirgacheffe": {
    category: "coffee",
    tastingTitle: "Floral\nAroma",
    notes:
      "Ethiopian Yirgacheffe single origin for vibrant crisp acidity and pronounced floral aromatics.",
    metric1Value: "0.5",
    metric1Desc:
      "Grind size. Optimized surface area for perfect espresso extraction.",
    metric2Title: "Perfect\nPour",
    metric2Value1: "0.75",
    metric2Value1Sub: "Crema Viscosity",
    metric2Value2: "26.5s",
    metric2Value2Sub: "Extraction Time",
    metric2Desc:
      "Bright, clean, and tea-like body, emphasizing origin characteristics.",
    diagramTemp: "92°C",
    diagramProfile: "Light-Med",
    diagramPressure: "9 BAR",
    diagramDose: "18.5g",
    actionText: "ACQUIRE NOW",
    accent: "#ceb693",
    theme: true, // isDark
    accessoryTitle: "Hardware",
    accessoryHeading: "Precision\nEngineered",
    accessoryDesc:
      "Interact with our 3D equipment concept. Every micron of adjustment matters when extracting the perfect shot. Our conceptual grinder brings commercial-grade precision to the digital experience.",
  },
  "Design Systems": {
    category: "book",
    tastingTitle: "Design\nFirst",
    notes:
      "A comprehensive guide to creating scalable digital products and unifying component libraries.",
    metric1Value: "350",
    metric1Desc: "Pages of high-quality lithographic printing on matte paper.",
    metric2Title: "Knowledge\nScale",
    metric2Value1: "1st",
    metric2Value1Sub: "Edition",
    metric2Value2: "1.2kg",
    metric2Value2Sub: "Weight",
    metric2Desc:
      "Heavyweight hardcover bound to last through years of reference.",
    diagramTemp: "Print",
    diagramProfile: "CMYK",
    diagramPressure: "Hardcover",
    diagramDose: '10x12"',
    actionText: "PRE-ORDER",
    accent: "#3b82f6",
    theme: false, // isDark (light theme)
    accessoryTitle: "Accessories",
    accessoryHeading: "Illuminate\nKnowledge",
    accessoryDesc:
      "Interact with our 3D reading lamp concept. Perfect lumens for late night deep reading sessions. Engineered to reduce eye strain.",
  },
  "Tortoise Shell Frames": {
    category: "glasses",
    tastingTitle: "Vintage\nChic",
    notes:
      "Vintage aesthetic with modern premium acetate. Hand-polished for a beautiful shine.",
    metric1Value: "CR39",
    metric1Desc: "Optical precision lenses with anti-reflective coating.",
    metric2Title: "Clarity\nVision",
    metric2Value1: "UV400",
    metric2Value1Sub: "Protection",
    metric2Value2: "18g",
    metric2Value2Sub: "Frame Weight",
    metric2Desc:
      "Feather-light frame ensuring all-day comfort without pressure points.",
    diagramTemp: "Acetate",
    diagramProfile: "Classic",
    diagramPressure: "5-Barrel",
    diagramDose: "49-21-145",
    actionText: "TRY ON",
    accent: "#f59e0b",
    theme: true,
    accessoryTitle: "Protection",
    accessoryHeading: "Premium\nStorage",
    accessoryDesc:
      "Interact with our premium leather case concept. Protect your lenses with style. Designed for everyday carry and durability.",
  },
  "Minimalist Chrono": {
    category: "watch",
    tastingTitle: "Timeless\nPrecision",
    notes:
      "Sleek automatic timepiece with a brushed steel dial and domed sapphire crystal.",
    metric1Value: "28k",
    metric1Desc: "Vibrations per hour for a sweeping second hand.",
    metric2Title: "Engineered\nMotion",
    metric2Value1: "50m",
    metric2Value1Sub: "Water Resist",
    metric2Value2: "40h",
    metric2Value2Sub: "Power Reserve",
    metric2Desc: "Powered by your kinetic motion. Intricate mechanical heart.",
    diagramTemp: "Auto",
    diagramProfile: "Swiss",
    diagramPressure: "Sapphire",
    diagramDose: "40mm",
    actionText: "ACQUIRE",
    accent: "#10b981",
    theme: false,
    accessoryTitle: "Maintenance",
    accessoryHeading: "Wind &\nMaintain",
    accessoryDesc:
      "Interact with our automatic watch winder concept. Keep your mechanical movement perfectly tuned when not on the wrist.",
  },
};

const defaultInfo = {
  category: "item",
  tastingTitle: "Premium\nChoice",
  notes: "Meticulously crafted for the discerning individual.",
  metric1Value: "100%",
  metric1Desc: "Premium quality materials and finishing.",
  metric2Title: "Perfect\nBalance",
  metric2Value1: "A+",
  metric2Value1Sub: "Rating",
  metric2Value2: "100",
  metric2Value2Sub: "Score",
  metric2Desc: "Exceeds all standards of excellence.",
  diagramTemp: "Standard",
  diagramProfile: "Premium",
  diagramPressure: "Quality",
  diagramDose: "1 Unit",
  actionText: "BUY NOW",
  accent: "#cfcfcf",
  theme: true,
  accessoryTitle: "Accessories",
  accessoryHeading: "Premium\nAdd-ons",
  accessoryDesc:
    "Interact with our 3D conceptual accessories, perfectly designed to pair with your product.",
};

interface PasswordAnalysis {
  score: number;
  label: string;
  color: string;
  textColor: string;
  advice: string;
  checks: {
    length: boolean;
    lengthUltra: boolean;
    upper: boolean;
    lower: boolean;
    number: boolean;
    symbol: boolean;
  };
}

const analyzePassword = (pass: string): PasswordAnalysis => {
  if (!pass) {
    return {
      score: 0,
      label: "Enter a Password",
      color: "bg-border/30",
      textColor: "text-text-muted/60",
      advice: "💡 Enter a secure combination of letters, numbers, and symbols to establish safety.",
      checks: { length: false, lengthUltra: false, upper: false, lower: false, number: false, symbol: false }
    };
  }

  const checks = {
    length: pass.length >= 8,
    lengthUltra: pass.length >= 12,
    upper: /[A-Z]/.test(pass),
    lower: /[a-z]/.test(pass),
    number: /[0-9]/.test(pass),
    symbol: /[^A-Za-z0-9]/.test(pass),
  };

  // Score calculation
  let score = 0;
  if (checks.length) score += 1;
  if (checks.upper && checks.lower) score += 1;
  if (checks.number) score += 1;
  if (checks.symbol) score += 1;
  if (checks.lengthUltra && score >= 3) score += 1;

  let label = "Very Weak";
  let color = "bg-red-500";
  let textColor = "text-red-400";
  let advice = "💡 Add more characters to build a strong foundation. Long passwords are much harder to crack.";

  if (score === 1) {
    label = "Weak";
    color = "bg-orange-500/80";
    textColor = "text-orange-400";
    advice = "💡 Pro Tip: Mix in both uppercase letters and numbers to increase complexity rapidly.";
  } else if (score === 2) {
    label = "Moderate";
    color = "bg-yellow-500/80";
    textColor = "text-yellow-400";
    advice = "💡 Pro Tip: Inject special symbols (like !, @, $, #) to make your password highly resilient.";
  } else if (score === 3) {
    label = "Strong";
    color = "bg-emerald-500/80";
    textColor = "text-emerald-400";
    advice = "💡 Pro Tip: You are almost there! Make it 12+ characters to cross into the 'Bulletproof' luxury class.";
  } else if (score >= 4) {
    label = "Bulletproof";
    color = "bg-accent";
    textColor = "text-accent";
    advice = "🛡️ God Mode: This password is mathematically secure and exceptionally resilient against brute-force attacks!";
  }

  return { score, label, color, textColor, advice, checks };
};

export default function MainLayout() {
  const container = useRef<HTMLDivElement>(null);
  const [isDark, setIsDark] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const lastScrollY = useRef(0);

  const [products, setProducts] = useState<any[]>([]);
  const [addedIds, setAddedIds] = useState<Record<number, boolean>>({});
  const [currentProductIndex, setCurrentProductIndex] = useState(0);

  // Premium God Mode Customizer States
  const [materialFinish, setMaterialFinish] = useState<
    "standard" | "matte" | "chroma"
  >("standard");
  const [objectScale, setObjectScale] = useState<number>(1.0);
  const [laserEngraving, setLaserEngraving] = useState<string>("");
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true); // default active for physical tactile response
  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState<boolean>(false);

  // Premium Customer Authentication and Transaction State Registers
  const [user, setUser] = useState<{ id: number; email: string; name: string } | null>(() => {
    try {
      const saved = localStorage.getItem("ae_vault_session");
      return saved ? JSON.parse(saved) : null;
    } catch (_) {
      return null;
    }
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<"idle" | "loading" | "success" | "failed">("idle");
  const [registerPassword, setRegisterPassword] = useState("");
  const passwordAnalysis = analyzePassword(registerPassword);

  const handleGoogleSignIn = async () => {
    if (isGoogleLoading) return;
    setIsGoogleLoading(true);
    setAuthError(null);
    if (isSoundEnabled) playTick();

    try {
      const redirectUri = `${window.location.origin}/api/auth/google/callback`;
      const response = await fetch(`/api/auth/google/url?redirect_uri=${encodeURIComponent(redirectUri)}`);
      if (!response.ok) {
        throw new Error("Failed to initialize Google login session.");
      }
      const data = await response.json();
      
      const width = 500;
      const height = 650;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const authWindow = window.open(
        data.url,
        "google_oauth_popup",
        `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes,scrollbars=yes`
      );

      if (!authWindow) {
        setAuthError("Popup blocked! Please allow popups for this site to complete Google Sign In.");
        setIsGoogleLoading(false);
      } else {
        // Monitor popup closure to reset loading state cleanly if they dismiss the window
        const monitorPopupTimer = setInterval(() => {
          if (authWindow.closed) {
            clearInterval(monitorPopupTimer);
            setIsGoogleLoading(false);
          }
        }, 800);
      }
    } catch (err) {
      console.error("Google Sign-In initialization failed:", err);
      setAuthError("Failed to initiate Google Sign-In. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  // Listen for successful OAuth messages from the popup window
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith(".run.app") && !origin.includes("localhost") && !origin.includes("127.0.0.1")) {
        return;
      }

      if (event.data?.type === "OAUTH_AUTH_SUCCESS") {
        const loggedUser = event.data.user;
        if (loggedUser) {
          setUser(loggedUser);
          localStorage.setItem("ae_vault_session", JSON.stringify(loggedUser));
          setIsAuthOpen(false);
          setIsGoogleLoading(false);
          if (isSoundEnabled) playChime();
          setCustomAlert({ 
            message: `Successfully verified and signed in via Google as ${loggedUser.name}.`, 
            type: "success" 
          });
        }
      }
    };

    window.addEventListener("message", handleOAuthMessage);
    return () => window.removeEventListener("message", handleOAuthMessage);
  }, [isSoundEnabled]);
  const [checkoutOrderDetails, setCheckoutOrderDetails] = useState<any>(null);

  // God Mode Interactive States for Production level upgrade
  const [customAlert, setCustomAlert] = useState<{ message: string; type: "error" | "success" | "info" } | null>(null);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [isGoogleChooserOpen, setIsGoogleChooserOpen] = useState(false);
  const [isSimulatedStripeOpen, setIsSimulatedStripeOpen] = useState(false);
  const [simulatedStripeDetails, setSimulatedStripeDetails] = useState<any>(null);
  const [stripeFormInput, setStripeFormInput] = useState({
    cardNumber: "",
    expiry: "",
    cvc: "",
    name: "",
  });
  const [stripeFormError, setStripeFormError] = useState<string | null>(null);
  const [isStagingPayment, setIsStagingPayment] = useState(false);
  const [focusedOnCvc, setFocusedOnCvc] = useState(false);

  // Defer canvas mounting to make initial layout paint lightning fast and responsive
  const [renderCanvases, setRenderCanvases] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setRenderCanvases(true);
    }, 250);
    return () => clearTimeout(timer);
  }, []);

  // Auto-clear custom notifications
  useEffect(() => {
    if (customAlert) {
      const timer = setTimeout(() => {
        setCustomAlert(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [customAlert]);

  // Auto Parse Secure Stripe Transaction callbacks on viewport mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      setCheckoutStatus("success");
      setCheckoutOrderDetails({
        orderId: "AE-STRIPE-" + Math.floor(100000 + Math.random() * 900000),
        secureHash: params.get("session_id")?.slice(0, 24) || "CRYPTO-STRIPE-SECURE",
        paymentMethod: "Stripe Secure Bank Auth",
        isStripeReal: true,
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get("checkout") === "cancel") {
      setCheckoutStatus("failed");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Synced ambient audio loop side-effect for Zen Museum Mode
  useEffect(() => {
    if (isZenMode && isSoundEnabled) {
      startZenDrone();
    } else {
      stopZenDrone();
    }
    return () => {
      stopZenDrone();
    };
  }, [isZenMode, isSoundEnabled]);

  // Elite Celestial Footer States
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [dialRotation, setDialRotation] = useState(0);
  const [isDialHovered, setIsDialHovered] = useState(false);
  const [simulatorActive, setSimulatorActive] = useState(false);
  const [simulatorStatus, setSimulatorStatus] = useState<string>("IDLE");
  const [simulatorValue1, setSimulatorValue1] = useState(0);
  const [simulatorValue2, setSimulatorValue2] = useState(0);
  const [simulatorTime, setSimulatorTime] = useState(0);

  const productInfo = products[currentProductIndex]
    ? productInfoMap[products[currentProductIndex].name_en] || defaultInfo
    : defaultInfo;

  useEffect(() => {
    // Reset dial simulation states on product change
    setSimulatorActive(false);
    setSimulatorStatus("IDLE");
    setSimulatorValue1(0);
    setSimulatorValue2(0);
    setSimulatorTime(0);
    setDialRotation(0);
  }, [currentProductIndex]);

  useEffect(() => {
    let interval: any;
    if (simulatorActive) {
      const category = productInfo.category || "item";
      setSimulatorTime(0);
      setSimulatorValue1(0);
      setSimulatorValue2(0);
      setDialRotation(0);

      if (category === "coffee") {
        setSimulatorStatus("RAMPING");
        let sec = 0;
        interval = setInterval(() => {
          sec += 0.1;
          const formattedSec = parseFloat(sec.toFixed(1));
          setSimulatorTime(formattedSec);
          if (sec <= 0.8) {
            const currentPressure = parseFloat((sec * 11.25).toFixed(1));
            setSimulatorValue2(currentPressure);
            setDialRotation(currentPressure * 15);
          } else if (sec < 2.5) {
            setSimulatorStatus("EXTRACTING");
            const jitter = parseFloat(
              (9.0 + Math.sin(sec * 12) * 0.12).toFixed(1),
            );
            setSimulatorValue2(jitter);
            setDialRotation(jitter * 15 + Math.sin(sec * 40) * 1.5);
            setSimulatorValue1((prev) => parseFloat((prev + 1.6).toFixed(1)));
          } else {
            setSimulatorStatus("DONE");
            setSimulatorValue2(0);
            setSimulatorActive(false);
            setDialRotation(0);
            clearInterval(interval);
          }
        }, 100);
      } else if (category === "watch") {
        setSimulatorStatus("ANALYZING");
        let sec = 0;
        interval = setInterval(() => {
          sec += 0.1;
          const formattedSec = parseFloat(sec.toFixed(1));
          setSimulatorTime(formattedSec);
          if (sec <= 1.0) {
            const estError = parseFloat((1.2 - sec * 0.4).toFixed(1));
            setSimulatorValue2(estError);
            setSimulatorValue1(Math.round(200 + sec * 50));
            setDialRotation(Math.sin(sec * 30) * 80);
          } else if (sec < 3.0) {
            setSimulatorStatus("REGULATING");
            const estError = parseFloat((0.8 - (sec - 1.0) * 0.35).toFixed(1));
            setSimulatorValue2(Math.max(0.1, estError));
            setSimulatorValue1(Math.round(250 + (sec - 1.0) * 24));
            setDialRotation(Math.sin(sec * 40) * 140);
          } else {
            setSimulatorStatus("CALIBRATED");
            setSimulatorValue2(0.1);
            setSimulatorValue1(298);
            setSimulatorActive(false);
            setDialRotation(0);
            clearInterval(interval);
          }
        }, 100);
      } else if (category === "glasses") {
        setSimulatorStatus("ALIGNING");
        let sec = 0;
        interval = setInterval(() => {
          sec += 0.1;
          const formattedSec = parseFloat(sec.toFixed(1));
          setSimulatorTime(formattedSec);
          if (sec <= 1.0) {
            setSimulatorValue2(Math.round(sec * 20));
            setSimulatorValue1(Math.round(sec * 30));
            setDialRotation(sec * 30);
          } else if (sec < 3.0) {
            setSimulatorStatus("REFRACTING");
            setSimulatorValue2(Math.round(20 + (sec - 1.0) * 40));
            setSimulatorValue1(Math.round(30 + (sec - 1.0) * 30));
            setDialRotation(30 + (sec - 1.0) * 30);
          } else {
            setSimulatorStatus("APPROVED");
            setSimulatorValue2(100);
            setSimulatorValue1(90);
            setSimulatorActive(false);
            setDialRotation(90);
            clearInterval(interval);
          }
        }, 100);
      } else if (category === "book") {
        setSimulatorStatus("LEXING");
        let sec = 0;
        interval = setInterval(() => {
          sec += 0.1;
          const formattedSec = parseFloat(sec.toFixed(1));
          setSimulatorTime(formattedSec);
          if (sec <= 1.0) {
            setSimulatorValue2(Math.round(45 + sec * 20));
            setSimulatorValue1(4);
            setDialRotation(30);
          } else if (sec < 3.0) {
            setSimulatorStatus("COMPILING");
            setSimulatorValue2(Math.round(65 + (sec - 1.0) * 17.5));
            setSimulatorValue1(Math.round(4 + (sec - 1.0) * 4));
            setDialRotation(60);
          } else {
            setSimulatorStatus("VALIDATED");
            setSimulatorValue2(100);
            setSimulatorValue1(12);
            setSimulatorActive(false);
            setDialRotation(100);
            clearInterval(interval);
          }
        }, 100);
      } else {
        setSimulatorStatus("INIT");
        let sec = 0;
        interval = setInterval(() => {
          sec += 0.1;
          const formattedSec = parseFloat(sec.toFixed(1));
          setSimulatorTime(formattedSec);
          if (sec <= 1.0) {
            setSimulatorValue2(Math.round(50 + sec * 15));
            setSimulatorValue1(parseFloat((sec * 3.3).toFixed(1)));
            setDialRotation(sec * 45);
          } else if (sec < 3.0) {
            setSimulatorStatus("TESTING");
            setSimulatorValue2(Math.round(65 + (sec - 1.0) * 17.5));
            setSimulatorValue1(
              parseFloat((3.3 + (sec - 1.0) * 3.35).toFixed(1)),
            );
            setDialRotation(45 + (sec - 1.0) * 27.5);
          } else {
            setSimulatorStatus("SECURED");
            setSimulatorValue2(100);
            setSimulatorValue1(10.0);
            setSimulatorActive(false);
            setDialRotation(100);
            clearInterval(interval);
          }
        }, 100);
      }
    }
    return () => clearInterval(interval);
  }, [simulatorActive, productInfo.category]);

  useEffect(() => {
    if (products.length > 0) {
      document.documentElement.style.setProperty(
        "--accent",
        productInfo.accent || "#ceb693",
      );
    }
  }, [currentProductIndex, products, productInfo]);

  useEffect(() => {
    fetch("/api/menu")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProducts(data.data);
          setTimeout(() => {
            ScrollTrigger.refresh();
          }, 100);
        }
      })
      .catch(console.error);

    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
      // time is in seconds, lenis expects milliseconds
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
    };
  }, []);

  const handleAddToCart = (id?: number) => {
    if (id !== undefined) {
      setAddedIds((prev) => ({ ...prev, [id]: true }));
      setIsCartOpen(true);
    }
  };

  const handleRemoveFromCart = (id: number) => {
    setAddedIds((prev) => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
  };

  const handleProceedToCheckout = async () => {
    if (isSoundEnabled) playTick();
    if (!user) {
      setIsAuthOpen(true);
      setAuthMode("login");
      return;
    }

    setCheckoutStatus("loading");
    try {
      const response = await fetch("/api/checkout/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            id: item.id,
            name_en: item.name_en,
            price: item.price,
            quantity: 1,
          })),
          email: user.email,
        }),
      });
      
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Unexpected checkout session response:", responseText);
        setCheckoutStatus("failed");
        setCustomAlert({ message: "Sensory core transaction gate returned an invalid format. Please try again.", type: "error" });
        return;
      }

      if (data.success) {
        if (data.mode === "stripe") {
          window.location.href = data.url;
        } else {
          // Open magnificent virtual credit card payment sheet instead of instant pass!
          setSimulatedStripeDetails({
            orderId: data.orderId,
            secureHash: data.secureHash,
          });
          // Pre-populate user name for luxury experience
          setStripeFormInput({
            cardNumber: "",
            expiry: "",
            cvc: "",
            name: user.name || "",
          });
          setStripeFormError(null);
          setIsSimulatedStripeOpen(true);
          setCheckoutStatus("idle");
          setIsCartOpen(false);
        }
      } else {
        setCheckoutStatus("failed");
        setCustomAlert({ message: data.error || "Acquisition session initialization failed.", type: "error" });
      }
    } catch (err) {
      console.error("Checkout dispatch error:", err);
      setCheckoutStatus("failed");
      setCustomAlert({ message: "Secure sandbox checkout service is offline.", type: "error" });
    }
  };

  const cartItems = products.filter((p) => addedIds[p.id]);
  const cartSubtotal = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.price || "0"),
    0,
  );
  const currentCartCount = cartItems.length;

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);

      if (currentScrollY <= 50) {
        setIsNavVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        setIsNavVisible(false);
      } else {
        setIsNavVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useGSAP(
    () => {
      gsap.to(".hero-bg-text", {
        y: -150,
        opacity: 0,
        scrollTrigger: {
          trigger: ".sec1",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to(".hero-bottom-bar", {
        y: 150,
        opacity: 0,
        scrollTrigger: {
          trigger: ".sec1",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to(".hero-nav-indicator, .hero-promotion", {
        opacity: 0,
        scrollTrigger: {
          trigger: ".sec1",
          start: "top top",
          end: "50% top",
          scrub: true,
        },
      });

      // Section 2: Elite Control
      gsap.from(".sec2-content > *", {
        y: 120,
        opacity: 0,
        stagger: 0.2,
        scrollTrigger: {
          trigger: ".sec2",
          start: "top 85%",
          end: "top 20%",
          scrub: 1.5,
        },
      });

      // Section 3: Perfect Flight
      gsap.from(".sec3-content > *", {
        y: 120,
        opacity: 0,
        stagger: 0.2,
        scrollTrigger: {
          trigger: ".sec3",
          start: "top 85%",
          end: "top 20%",
          scrub: 1.5,
        },
      });

      // Section 4: Target Diagram
      gsap.fromTo(
        ".sec4-diagram",
        {
          scale: 0.7,
          opacity: 0,
          rotation: -15,
          y: 100,
        },
        {
          scale: 1.1,
          opacity: 0.25,
          rotation: 0,
          y: -50,
          scrollTrigger: {
            trigger: ".sec4",
            start: "top 90%",
            end: "bottom 10%",
            scrub: 2,
          },
        },
      );

      gsap.from(".sec4-element", {
        opacity: 0,
        y: 50,
        scale: 0.8,
        stagger: 0.2,
        scrollTrigger: {
          trigger: ".sec4",
          start: "top 60%",
          end: "center center",
          scrub: 1.5,
        },
      });

      // Section 5: The Champion Edition
      gsap.from(".sec5-title", {
        y: -50,
        opacity: 0,
        scrollTrigger: {
          trigger: ".sec5",
          start: "top 80%",
          end: "center 60%",
          scrub: 1,
        },
      });
      gsap.from(".sec5-left", {
        x: -80,
        opacity: 0,
        scrollTrigger: {
          trigger: ".sec5",
          start: "top 70%",
          end: "center 70%",
          scrub: 1,
        },
      });
      gsap.from(".sec5-right", {
        x: 80,
        opacity: 0,
        scrollTrigger: {
          trigger: ".sec5",
          start: "top 70%",
          end: "center 70%",
          scrub: 1,
        },
      });

      // Section 6: Defy Gravity
      gsap.from(".sec6-content", {
        y: 100,
        scale: 0.95,
        opacity: 0,
        scrollTrigger: {
          trigger: ".sec6",
          start: "top 90%",
          end: "top 45%",
          scrub: 1,
        },
      });
    },
    { scope: container },
  );

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
    }
  }, [isDark]);

  return (
    <div
      ref={container}
      className="relative bg-bg-primary text-text-primary font-sans selection:bg-accent selection:text-text-inverted pb-0 overflow-x-hidden transition-colors duration-700"
    >
      {/* 3D Canvas fixed in background */}
      <div
        data-cursor={isZenMode ? "drag" : undefined}
        data-cursor-text={isZenMode ? "DRAG" : undefined}
        className={`fixed inset-0 z-0 ${isZenMode ? "pointer-events-auto cursor-grab active:cursor-grabbing" : "pointer-events-none"}`}
      >
        <Suspense fallback={<div className="w-full h-full bg-bg-primary" />}>
          {renderCanvases && (
            <HeroCanvas
              isDark={isDark}
              category={productInfo.category}
              accentColor={productInfo.accent}
              materialFinish={materialFinish}
              customScale={objectScale}
              isZen={isZenMode}
            />
          )}
        </Suspense>
      </div>

      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-[60] transition-transform duration-500 ease-in-out ${isNavVisible ? "translate-y-0" : "-translate-y-full"} ${isScrolled ? "bg-bg-primary/80 backdrop-blur-xl py-4 shadow-[0_4px_30px_rgba(0,0,0,0.1)] border-b border-border/50" : "bg-transparent py-6"} px-4 sm:px-6 md:px-8 flex justify-between items-center pointer-events-none`}
      >
        <div
          onClick={() => {
            if (!isZenMode && isSoundEnabled) playTick();
          }}
          className={`flex items-center gap-4 pointer-events-auto cursor-pointer group z-50 transition-all duration-700 ease-in-out ${
            isZenMode
              ? "opacity-0 -translate-x-10 pointer-events-none blur-sm"
              : "opacity-100 translate-x-0"
          }`}
        >
          <div className="w-10 h-10 bg-bg-inverted text-text-inverted flex items-center justify-center rounded-sm transition-colors duration-700 group-hover:bg-accent group-hover:text-text-inverted">
            <span className="font-display text-2xl leading-none mt-1">Æ</span>
          </div>
          <div className="font-display text-xl md:text-2xl leading-none tracking-wider mt-1 hidden sm:block text-text-primary">
            AESTHETE
            <br />
            STUDIO
          </div>
        </div>

        {/* Desktop Nav */}
        <nav
          className={`hidden lg:flex gap-8 lg:gap-12 text-xs font-medium tracking-[0.25em] uppercase pointer-events-auto text-text-muted absolute left-1/2 -translate-x-1/2 transition-all duration-700 ease-in-out ${
            isZenMode
              ? "opacity-0 -translate-y-4 pointer-events-none blur-sm"
              : "opacity-100 translate-y-0"
          }`}
        >
          <a
            href="#"
            className="font-sans text-accent hover:text-accent/80 transition-all duration-300"
            onClick={(e) => {
              e.preventDefault();
              if (isSoundEnabled) playTick();
              document
                .querySelector(".sec6")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Objects
          </a>
          <a
            href="#"
            className="font-sans hover:text-text-primary transition-all duration-300"
            onClick={(e) => {
              e.preventDefault();
              if (isSoundEnabled) playTick();
              document
                .querySelector(".h-auto")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Craft
          </a>
          <a
            href="#"
            className="font-sans hover:text-text-primary transition-all duration-300"
            onClick={(e) => {
              e.preventDefault();
              if (isSoundEnabled) playTick();
              document
                .querySelector("footer")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Archives
          </a>
        </nav>

        <div className="flex gap-2 sm:gap-4 md:gap-6 pointer-events-auto items-center z-50">
          {/* Zen Museum Mode Toggle - Stays responsive & visible */}
          <button
            onClick={() => {
              const nextZen = !isZenMode;
              setIsZenMode(nextZen);
              if (isSoundEnabled) {
                playChime();
              }
            }}
            className={`relative flex items-center justify-center px-4 h-10 rounded-full border transition-all duration-500 overflow-hidden bg-bg-primary/50 backdrop-blur-md shadow-sm cursor-pointer z-51 ${
              isZenMode
                ? "border-accent text-accent shadow-lg shadow-accent/15 font-bold scale-102"
                : "border-border/50 text-text-muted hover:border-accent hover:text-text-primary"
            }`}
            aria-label="Toggle Zen Mode"
          >
            <div className="flex items-center gap-1.5 font-mono">
              <span
                className={`w-1.5 h-1.5 rounded-full ${isZenMode ? "bg-accent animate-pulse shadow-[0_0_8px_#ceb693]" : "bg-text-muted"}`}
              />
              <span className="text-[10px] tracking-[0.1em] sm:tracking-[0.2em] font-bold">
                {isZenMode ? (
                  <>
                    <span className="hidden sm:inline">EXIT </span>MUSEUM
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">ENTER </span>MUSEUM
                  </>
                )}
              </span>
            </div>
          </button>
          {/* Theme Toggle */}
          <button
            onClick={() => {
              setIsDark(!isDark);
            }}
            className={`relative flex items-center justify-center w-10 h-10 rounded-full border border-border/50 hover:border-accent group transition-all duration-700 overflow-hidden bg-bg-primary/50 backdrop-blur-md shadow-sm ${
              isZenMode
                ? "opacity-0 scale-95 pointer-events-none translate-x-5 blur-sm"
                : "opacity-100 translate-x-0"
            }`}
            aria-label="Toggle Theme"
          >
            <AnimatePresence mode="wait">
              {isDark ? (
                <motion.svg
                  key="moon"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-text-muted group-hover:text-accent"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </motion.svg>
              ) : (
                <motion.svg
                  key="sun"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-text-muted group-hover:text-accent"
                >
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </motion.svg>
              )}
            </AnimatePresence>
          </button>

          {/* Cart Toggle */}
          <button
            onClick={() => {
              setIsCartOpen(true);
              if (isSoundEnabled) playTick();
            }}
            className={`relative w-10 h-10 flex items-center justify-center hover:text-accent transition-all duration-700 bg-bg-primary/50 backdrop-blur-md rounded-full border border-border/50 shadow-sm cursor-pointer ${
              isZenMode
                ? "opacity-0 scale-95 pointer-events-none translate-x-5 blur-sm"
                : "opacity-100 translate-x-0"
            }`}
          >
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <AnimatePresence>
              {currentCartCount > 0 && (
                <motion.div
                  key={currentCartCount}
                  initial={{ scale: 0, y: -10 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 bg-accent text-bg-primary text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full pointer-events-none shadow-sm shadow-accent/20 z-10 border border-bg-primary"
                >
                  {currentCartCount}
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* User Vault Security Gateway */}
          <button
            onClick={() => {
              if (user) {
                setLogoutConfirmOpen(true);
                if (isSoundEnabled) playTick();
              } else {
                setIsAuthOpen(true);
                setAuthMode("login");
                if (isSoundEnabled) playTick();
              }
            }}
            className={`relative w-10 h-10 flex items-center justify-center hover:text-accent transition-all duration-700 bg-bg-primary/50 backdrop-blur-md rounded-full border border-border/50 shadow-sm cursor-pointer ${
              isZenMode
                ? "opacity-0 scale-95 pointer-events-none translate-x-5 blur-sm"
                : "opacity-100 translate-x-0"
            }`}
            title={user ? `Signed in as ${user.name} (${user.email})` : "Access Secure Vault"}
            data-cursor-text={user ? "SIGN OUT" : "SECURE VAULT"}
          >
            {user ? (
              <span className="text-[10px] font-mono tracking-tighter text-accent font-bold">
                {user.name ? user.name.slice(0, 2).toUpperCase() : "US"}
              </span>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
            {user && (
              <span className="absolute bottom-1 right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse border border-bg-primary" />
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            className={`lg:hidden relative w-10 h-10 flex items-center justify-center bg-bg-primary/50 backdrop-blur-md rounded-full border border-border/50 text-text-primary shadow-sm cursor-pointer transition-all duration-700 ${
              isZenMode
                ? "opacity-0 scale-95 pointer-events-none translate-x-5 blur-sm"
                : "opacity-100 translate-x-0"
            }`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
              className="absolute top-full left-0 right-0 bg-bg-primary/95 backdrop-blur-xl border-b border-border/50 shadow-2xl py-8 px-6 pointer-events-auto flex flex-col gap-6 lg:hidden z-40 origin-top"
            >
              <a
                href="#"
                className="text-xs font-sans font-semibold uppercase tracking-[0.25em] py-1 text-accent"
                onClick={(e) => {
                  e.preventDefault();
                  setIsMobileMenuOpen(false);
                  document
                    .querySelector(".sec6")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Objects
              </a>
              <hr className="border-border/30" />
              <a
                href="#"
                className="text-xs font-sans font-semibold uppercase tracking-[0.25em] py-1 hover:text-accent transition-all duration-300 text-text-primary"
                onClick={(e) => {
                  e.preventDefault();
                  setIsMobileMenuOpen(false);
                  document
                    .querySelector(".h-auto")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Craft
              </a>
              <hr className="border-border/30" />
              <a
                href="#"
                className="text-xs font-sans font-semibold uppercase tracking-[0.25em] py-1 hover:text-accent transition-all duration-300 text-text-primary"
                onClick={(e) => {
                  e.preventDefault();
                  setIsMobileMenuOpen(false);
                  document
                    .querySelector("footer")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Archives
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Floating Customizer Console specifically in Zen Museum Mode */}
      <AnimatePresence>
        {isZenMode && (
          <div className="fixed left-6 md:left-10 top-[20%] md:top-1/4 z-[50] flex flex-col gap-4 w-[calc(100%-3rem)] max-w-[280px] md:max-w-[300px] pointer-events-auto">
            {/* Left Customizer Button (Selector 1) */}
            <div
              onClick={() => {
                setIsCustomizerOpen(!isCustomizerOpen);
                if (isSoundEnabled) playTick();
              }}
              className="flex items-center gap-4 cursor-pointer group"
            >
              <div
                className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all duration-300 ${
                  isCustomizerOpen
                    ? "border-accent text-accent bg-accent/10 shadow-[0_0_12px_rgba(206,182,147,0.25)]"
                    : "border-border/60 text-text-muted group-hover:border-accent group-hover:text-accent"
                }`}
              >
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 12h6" />
                </svg>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold tracking-widest uppercase text-text-muted group-hover:text-text-primary transition-colors">
                  THE
                  <br />
                  CUSTOMIZER
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${isCustomizerOpen ? "bg-accent animate-pulse shadow-[0_0_6px_#ceb693]" : "bg-text-muted/40"}`}
                  />
                  <span className="text-[8px] font-mono tracking-wider font-bold uppercase text-accent/80">
                    {isCustomizerOpen ? "CONSOLE ACTIVE" : "CLICK TO EDIT"}
                  </span>
                </div>
              </div>
            </div>

            {/* Customizer Console Panel */}
            <div className="relative mt-2">
              <AnimatePresence>
                {isCustomizerOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0, scale: 0.95 }}
                    animate={{ height: "auto", opacity: 1, scale: 1 }}
                    exit={{ height: 0, opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden bg-bg-primary/45 backdrop-blur-xl p-4 md:p-5 border border-border/40 rounded-sm shadow-xl transition-all duration-500 hover:border-accent/40 text-text-primary space-y-4"
                  >
                    {/* Material Finishes */}
                    <div className="space-y-1.5 pt-1">
                      <label className="text-[9px] tracking-wider text-text-muted uppercase font-bold font-mono">
                        Material Finish
                      </label>
                      <div className="grid grid-cols-3 gap-1">
                        {(["standard", "matte", "chroma"] as const).map((f) => (
                          <button
                            key={f}
                            onClick={() => {
                              setMaterialFinish(f);
                              if (isSoundEnabled) playTick();
                            }}
                            className={`px-2 py-1 text-[9px] font-mono font-bold tracking-wider uppercase border transition-all duration-300 rounded-sm ${
                              materialFinish === f
                                ? "bg-accent border-accent text-bg-primary shadow-sm font-semibold"
                                : "border-border/60 text-text-primary hover:border-accent hover:bg-accent/10"
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Physical Scale Slider */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[9px] tracking-wider text-text-muted uppercase font-bold font-mono">
                        <span>Scale Multiplier</span>
                        <span className="text-accent font-semibold font-mono">
                          {objectScale.toFixed(2)}x
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.75"
                        max="1.5"
                        step="0.05"
                        value={objectScale}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setObjectScale(val);
                          if (isSoundEnabled && Math.random() < 0.25)
                            playTick();
                        }}
                        className="w-full h-[2px] rounded-full appearance-none bg-border/60 hover:bg-accent/40 accent-accent cursor-ew-resize transition-colors outline-none"
                      />
                    </div>

                    {/* Custom Laser Engraving */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] tracking-wider text-text-muted uppercase font-bold font-mono">
                        Laser Engraving
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          maxLength={16}
                          placeholder="ENTER TEXT"
                          value={laserEngraving}
                          onChange={(e) => {
                            setLaserEngraving(e.target.value.toUpperCase());
                            if (isSoundEnabled) playTick();
                          }}
                          className="w-full bg-bg-primary/50 border border-border/40 hover:border-accent focus:border-accent outline-none text-[10px] font-mono px-2 md:px-2.5 py-1 tracking-wider rounded-sm transition-all text-text-primary placeholder:text-text-muted/30"
                        />
                        {laserEngraving && (
                          <button
                            onClick={() => {
                              setLaserEngraving("");
                              if (isSoundEnabled) playTick();
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-accent hover:text-text-primary font-mono"
                          >
                            CLEAR
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Acoustic Feedback Toggle */}
                    <div className="flex items-center justify-between border-t border-border/20 pt-3 mt-2">
                      <div className="flex flex-col select-none">
                        <span className="text-[9px] tracking-wider font-bold uppercase font-mono text-text-primary">
                          Tactile Synths
                        </span>
                        <span className="text-[7.5px] text-text-muted font-bold font-mono uppercase">
                          Clicks & Drone
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          const nextSound = !isSoundEnabled;
                          setIsSoundEnabled(nextSound);
                          if (nextSound) {
                            setTimeout(() => playChime(), 100);
                          }
                        }}
                        className={`w-[38px] h-[18px] flex items-center rounded-full p-0.5 transition-colors duration-300 ${
                          isSoundEnabled ? "bg-accent" : "bg-border/60"
                        }`}
                      >
                        <div
                          className={`w-[14px] h-[14px] rounded-full bg-bg-primary shadow-sm transform transition-transform duration-300 ${
                            isSoundEnabled
                              ? "translate-x-[20px]"
                              : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Scrollable Content */}
      <div
        className={`relative z-10 w-full pointer-events-none transition-all duration-[1200ms] ease-in-out ${
          isZenMode
            ? "opacity-0 scale-[0.98] pointer-events-none blur-md select-none"
            : "opacity-100 scale-100"
        }`}
      >
        {/* Section 1: Hero */}
        <section className="sec1 h-screen w-full relative flex flex-col justify-center items-center">
          {/* Center Giant Text */}
          <div className="hero-bg-text absolute inset-0 flex items-center justify-center -z-10 overflow-hidden px-4">
            <h1 className="text-[12vw] sm:text-[10vw] md:text-[8vw] lg:text-[7vw] font-display text-text-primary/5 select-none tracking-tighter leading-none text-center">
              {products[currentProductIndex]
                ? products[currentProductIndex].name_en.toUpperCase()
                : "PREMIUM"}
            </h1>
          </div>

          {/* Left Customizer Button (Selector 1) and Customizer Console Panel */}
          <div
            onClick={() => {
              setIsCustomizerOpen(!isCustomizerOpen);
              if (isSoundEnabled) playTick();
            }}
            className="hero-promotion absolute left-6 md:left-10 top-[20%] md:top-1/4 flex items-center gap-4 pointer-events-auto cursor-pointer group z-[46]"
          >
            <div
              className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all duration-300 ${
                isCustomizerOpen
                  ? "border-accent text-accent bg-accent/10 shadow-[0_0_12px_rgba(206,182,147,0.25)]"
                  : "border-border/60 text-text-muted group-hover:border-accent group-hover:text-accent"
              }`}
            >
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 12h6" />
              </svg>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold tracking-widest uppercase text-text-muted group-hover:text-text-primary transition-colors">
                THE
                <br />
                CUSTOMIZER
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${isCustomizerOpen ? "bg-accent animate-pulse shadow-[0_0_6px_#ceb693]" : "bg-text-muted/40"}`}
                />
                <span className="text-[8px] font-mono tracking-wider font-bold uppercase text-accent/80">
                  {isCustomizerOpen ? "CONSOLE ACTIVE" : "CLICK TO EDIT"}
                </span>
              </div>
            </div>
          </div>

          {/* Absolute-positioned Customizer Console on the Hero Page */}
          <div className="absolute left-6 md:left-10 top-[28%] md:top-[34%] z-[45] flex flex-col gap-4 w-[calc(100%-3rem)] max-w-[280px] md:max-w-[300px] pointer-events-auto">
            <AnimatePresence>
              {isCustomizerOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0, scale: 0.95 }}
                  animate={{ height: "auto", opacity: 1, scale: 1 }}
                  exit={{ height: 0, opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden bg-bg-primary/45 backdrop-blur-xl p-4 md:p-5 border border-border/40 rounded-sm shadow-xl transition-all duration-500 hover:border-accent/40 text-text-primary space-y-4"
                >
                  {/* Material Finishes */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[9px] tracking-wider text-text-muted uppercase font-bold font-mono">
                      Material Finish
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {(["standard", "matte", "chroma"] as const).map((f) => (
                        <button
                          key={f}
                          onClick={() => {
                            setMaterialFinish(f);
                            if (isSoundEnabled) playTick();
                          }}
                          className={`px-2 py-1 text-[9px] font-mono font-bold tracking-wider uppercase border transition-all duration-300 rounded-sm ${
                            materialFinish === f
                              ? "bg-accent border-accent text-bg-primary shadow-sm font-semibold"
                              : "border-border/60 text-text-primary hover:border-accent hover:bg-accent/10"
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Physical Scale Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[9px] tracking-wider text-text-muted uppercase font-bold font-mono">
                      <span>Scale Multiplier</span>
                      <span className="text-accent font-semibold font-mono">
                        {objectScale.toFixed(2)}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.75"
                      max="1.5"
                      step="0.05"
                      value={objectScale}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setObjectScale(val);
                        if (isSoundEnabled && Math.random() < 0.25) playTick();
                      }}
                      className="w-full h-[2px] rounded-full appearance-none bg-border/60 hover:bg-accent/40 accent-accent cursor-ew-resize transition-colors outline-none"
                    />
                  </div>

                  {/* Custom Laser Engraving */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] tracking-wider text-text-muted uppercase font-bold font-mono">
                      Laser Engraving
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={16}
                        placeholder="ENTER TEXT"
                        value={laserEngraving}
                        onChange={(e) => {
                          setLaserEngraving(e.target.value.toUpperCase());
                          if (isSoundEnabled) playTick();
                        }}
                        className="w-full bg-bg-primary/50 border border-border/40 hover:border-accent focus:border-accent outline-none text-[10px] font-mono px-2 md:px-2.5 py-1 tracking-wider rounded-sm transition-all text-text-primary placeholder:text-text-muted/30"
                      />
                      {laserEngraving && (
                        <button
                          onClick={() => {
                            setLaserEngraving("");
                            if (isSoundEnabled) playTick();
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-accent hover:text-text-primary font-mono"
                        >
                          CLEAR
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Acoustic Feedback Toggle */}
                  <div className="flex items-center justify-between border-t border-border/20 pt-3 mt-2">
                    <div className="flex flex-col select-none">
                      <span className="text-[9px] tracking-wider font-bold uppercase font-mono text-text-primary">
                        Tactile Synths
                      </span>
                      <span className="text-[7.5px] text-text-muted font-bold font-mono uppercase">
                        Clicks & Drone
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        const nextSound = !isSoundEnabled;
                        setIsSoundEnabled(nextSound);
                        if (nextSound) {
                          setTimeout(() => playChime(), 100);
                        }
                      }}
                      className={`w-[38px] h-[18px] flex items-center rounded-full p-0.5 transition-colors duration-300 ${
                        isSoundEnabled ? "bg-accent" : "bg-border/60"
                      }`}
                    >
                      <div
                        className={`w-[14px] h-[14px] rounded-full bg-bg-primary shadow-sm transform transition-transform duration-300 ${
                          isSoundEnabled
                            ? "translate-x-[20px]"
                            : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Nav Indicator */}
          <div className="hero-nav-indicator absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-4 pointer-events-auto hidden md:flex rotate-90 origin-right">
            <span className="text-accent text-[10px] font-bold tracking-[0.3em]">
              {String(currentProductIndex + 1).padStart(2, "0")}/
              {String(Math.max(1, products.length)).padStart(2, "0")}
            </span>
            <div className="w-12 h-px bg-border"></div>
          </div>

          {/* Bottom Bar */}
          <div className="hero-bottom-bar absolute bottom-6 md:bottom-10 left-4 right-4 md:left-8 md:right-8 flex flex-col md:flex-row justify-between items-center md:items-end gap-6 md:gap-0">
            <div className="space-y-1 pointer-events-auto text-center md:text-left w-full md:w-1/3">
              <div className="text-accent text-3xl md:text-4xl font-display tracking-wide">
                $
                {products[currentProductIndex]
                  ? products[currentProductIndex].price
                  : "24.99"}
              </div>
              <AnimatePresence>
                {laserEngraving && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                    className="mt-2 text-[8px] font-mono font-bold tracking-widest text-accent bg-accent/10 border border-accent/25 px-2.5 py-1 inline-flex items-center gap-1.5 rounded-sm"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
                    <span>ENGRAVING: &quot;{laserEngraving}&quot;</span>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="text-[10px] text-text-muted font-bold tracking-[0.2em] uppercase">
                {products[currentProductIndex]
                  ? products[currentProductIndex].name_en
                  : "Size: 250g • Whole Bean"}
              </div>
            </div>

            <div className="flex flex-col items-center pointer-events-auto w-full md:w-1/3">
              <MagneticWrapper>
                <button
                  onClick={() =>
                    handleAddToCart(products[currentProductIndex]?.id)
                  }
                  className="bg-accent text-bg-primary font-sans tracking-[0.25em] text-[10px] sm:text-xs px-8 sm:px-10 py-3.5 rounded-full hover:bg-bg-inverted hover:text-text-inverted transition-[color,background-color,box-shadow,opacity] duration-300 shadow-md hover:shadow-lg shadow-accent/15 uppercase font-semibold"
                >
                  {productInfo.actionText}
                </button>
              </MagneticWrapper>
            </div>

            <div className="flex gap-4 pointer-events-auto w-full md:w-1/3 justify-center md:justify-end">
              <button
                onClick={() => {
                  setCurrentProductIndex((prev) =>
                    prev > 0 ? prev - 1 : Math.max(0, products.length - 1),
                  );
                  if (isSoundEnabled) playTick();
                }}
                className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-border flex items-center justify-center hover:bg-bg-inverted hover:text-text-inverted transition-colors"
              >
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                onClick={() => {
                  setCurrentProductIndex((prev) =>
                    prev < products.length - 1 ? prev + 1 : 0,
                  );
                  if (isSoundEnabled) playTick();
                }}
                className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-bg-inverted text-text-inverted flex items-center justify-center hover:bg-accent hover:text-bg-primary transition-colors"
              >
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        {/* Section 2: Elite Control (Text Left) */}
        <section className="sec2 h-screen w-full relative flex items-center px-8 md:px-24 border-t border-border">
          <div className="sec2-content w-full md:w-[40%] space-y-12">
            <div className="space-y-2">
              <div className="text-accent text-[10px] font-bold tracking-[0.3em] uppercase">
                Details
              </div>
              <h2 className="text-4xl sm:text-6xl md:text-8xl font-display leading-[1.05] md:leading-[0.85] tracking-tight uppercase whitespace-pre-line">
                {productInfo.tastingTitle}
              </h2>
            </div>

            <div className="w-full h-px bg-border"></div>

            <div className="space-y-10">
              <div className="space-y-2">
                <div className="text-[10px] text-text-muted font-bold tracking-widest uppercase mb-1">
                  Description
                </div>
                <p className="text-sm text-text-muted/80 leading-relaxed max-w-sm mt-2">
                  {productInfo.notes}
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-5xl font-display tracking-wide">
                  {productInfo.metric1Value}
                </div>
                <div className="text-[10px] text-text-muted font-bold tracking-widest uppercase">
                  Specification
                </div>
                <p className="text-sm text-text-muted/80 leading-relaxed max-w-sm mt-2">
                  {productInfo.metric1Desc}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Perfect Flight (Text Right) */}
        <section className="sec3 h-screen w-full relative flex items-center justify-end px-8 md:px-24">
          <div className="sec3-content w-full md:w-[40%] space-y-12 text-right">
            <div className="space-y-2 flex flex-col items-end">
              <div className="text-accent text-[10px] font-bold tracking-[0.3em] uppercase">
                Key Metrics
              </div>
              <h2 className="text-4xl sm:text-6xl md:text-8xl font-display leading-[1.05] md:leading-[0.85] tracking-tight uppercase whitespace-pre-line">
                {productInfo.metric2Title}
              </h2>
            </div>

            <div className="w-full h-px bg-border"></div>

            <div className="flex flex-col items-end space-y-10">
              <div className="space-y-1 flex flex-col items-end">
                <div className="text-5xl font-display tracking-wide">
                  {productInfo.metric2Value1}
                </div>
                <div className="text-[10px] text-text-muted font-bold tracking-[0.2em] uppercase">
                  {productInfo.metric2Value1Sub}
                </div>
              </div>
              <div className="space-y-1 flex flex-col items-end">
                <div className="text-5xl font-display tracking-wide">
                  {productInfo.metric2Value2}
                </div>
                <div className="text-[10px] text-text-muted font-bold tracking-[0.2em] uppercase">
                  {productInfo.metric2Value2Sub}
                </div>
              </div>

              <p className="text-sm text-text-muted/80 leading-relaxed max-w-sm text-right mt-6">
                {productInfo.metric2Desc}
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Target Diagram */}
        <section className="sec4 h-screen w-full relative flex items-center justify-center">
          {/* Diagram UI overlaid around center */}
          <div className="sec4-diagram absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.25]">
            <div className="w-[60vh] h-[60vh] border border-text-primary rounded-full relative transition-colors duration-700">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-text-primary transition-colors duration-700"></div>
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-text-primary transition-colors duration-700"></div>
              <div className="absolute inset-4 border border-text-primary/50 rounded-full transition-colors duration-700"></div>
              <div className="absolute inset-12 border border-text-primary/30 rounded-full transition-colors duration-700"></div>

              {/* Elements attached to the circle */}
              <div className="sec4-element absolute top-[10%] left-[15%]">
                <div className="text-lg font-display tracking-widest text-text-primary mb-1 uppercase">
                  {productInfo.diagramTemp}
                </div>
                <div className="text-[10px] text-text-primary tracking-[0.2em] uppercase">
                  Temp / Material
                </div>
              </div>

              <div className="sec4-element absolute bottom-[10%] right-[15%] text-right">
                <div className="text-lg font-display tracking-widest text-text-primary mb-1 uppercase">
                  {productInfo.diagramProfile}
                </div>
                <div className="text-[10px] text-text-primary tracking-[0.2em] uppercase">
                  Profile / Style
                </div>
              </div>

              <div className="sec4-element absolute top-1/2 -left-32 sm:-left-24 -translate-y-1/2">
                <div className="text-[10px] text-text-primary tracking-[0.2em] uppercase text-right">
                  METRIC 1: {productInfo.diagramPressure}
                </div>
              </div>

              <div className="sec4-element absolute top-1/2 -right-24 -translate-y-1/2">
                <div className="text-[10px] text-text-primary tracking-[0.2em] uppercase">
                  METRIC 2: {productInfo.diagramDose}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: The Champion Edition */}
        <section className="sec5 h-screen w-full relative flex items-center justify-center px-4 md:px-24">
          <div className="sec5-title absolute top-[15%] left-0 right-0 flex flex-col items-center">
            <div className="text-accent text-[10px] font-bold tracking-[0.3em] uppercase mb-4 pt-10">
              Featured Line
            </div>
            <h2 className="text-5xl sm:text-7xl md:text-[8vw] font-display leading-[1.05] md:leading-[0.85] tracking-tight uppercase text-center">
              COLLECTION
            </h2>
          </div>

          <div className="sec5-left absolute bottom-[32%] md:bottom-[20%] left-6 sm:left-12 md:left-24 max-w-[150px] sm:max-w-[200px]">
            <div className="text-[10px] font-bold text-accent tracking-widest uppercase mb-1 sm:mb-2">
              Grade #1
            </div>
            <div className="text-2xl md:text-3xl font-display tracking-wide mb-2 sm:mb-3">
              Specialty
            </div>
            <p className="text-[10px] md:text-xs text-text-muted leading-relaxed">
              Crafted for the highest level of quality and design separation.
            </p>
          </div>

          <div className="sec5-right absolute bottom-[12%] md:bottom-[20%] right-6 sm:right-12 md:right-24 text-right max-w-[150px] sm:max-w-[200px]">
            <div className="text-[10px] font-bold text-accent tracking-widest uppercase mb-1 sm:mb-2">
              Certified
            </div>
            <div className="text-2xl md:text-3xl font-display tracking-wide mb-2 sm:mb-3">
              Premium Output
            </div>
            <p className="text-[10px] md:text-xs text-text-muted ml-auto leading-relaxed">
              Meets rigorous industry premium standards.
            </p>
          </div>
        </section>

        {/* Equipment Showcase */}
        <section className="h-auto w-full relative flex flex-col items-center justify-center px-4 md:px-24 py-32 pointer-events-auto z-20">
          <div className="w-full max-w-6xl flex flex-col md:flex-row items-center gap-16 bg-bg-primary/70 backdrop-blur-xl border border-border/50 rounded-3xl p-8 md:p-16 shadow-2xl transition-colors duration-700">
            <div className="w-full md:w-1/2 space-y-8 z-30">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-border/50 bg-bg-primary/50 text-accent text-[10px] font-bold tracking-[0.2em] uppercase backdrop-blur-md transition-colors duration-700">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                {productInfo.accessoryTitle}
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-display leading-[1.05] md:leading-[0.9] tracking-tight uppercase whitespace-pre-line text-text-primary drop-shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
                {productInfo.accessoryHeading}
              </h2>
              <p className="text-lg text-text-muted leading-relaxed max-w-md text-balance drop-shadow-sm font-medium">
                {productInfo.accessoryDesc}
              </p>
              <div className="w-12 h-px bg-accent/30 mt-6 transition-colors duration-700"></div>
              <div className="text-[10px] tracking-widest text-text-muted uppercase flex items-center gap-2 mt-4 inline-flex bg-bg-primary/40 px-3 py-1.5 rounded-md backdrop-blur-md shadow-sm border border-border/30 transition-colors duration-700">
                <svg
                  className="w-4 h-4 text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                  />
                </svg>
                Drag to interact in 3D
              </div>
            </div>

            <div className="w-full md:w-1/2 relative z-30 bg-bg-primary/30 rounded-2xl border border-border/30 shadow-inner backdrop-blur-sm p-1 transition-colors duration-700">
              <Suspense
                fallback={
                  <div className="w-full h-full min-h-[400px] flex items-center justify-center text-text-muted text-[10px] tracking-widest uppercase">
                    Initializing Canvas...
                  </div>
                }
              >
                {renderCanvases && (
                  <EquipmentCanvas
                    isDark={isDark}
                    category={productInfo.category}
                    accentColor={productInfo.accent}
                  />
                )}
              </Suspense>
            </div>
          </div>
        </section>

        {/* Section 6: Menu & Shop */}
        <section className="sec6 min-h-screen w-full relative flex flex-col items-center justify-center mt-32 pt-10 pb-32">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-primary/50 to-bg-primary pointer-events-none -z-10 transition-colors duration-700"></div>
          <div className="sec6-content flex flex-col items-center w-full max-w-6xl px-4 md:px-8 z-30">
            <div className="text-text-muted text-[10px] font-bold tracking-[0.3em] uppercase mb-6 border border-border/50 bg-bg-primary/60 backdrop-blur-md px-6 py-2 rounded-full shadow-sm transition-colors duration-700">
              Menu
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-[6vw] font-display leading-[1.05] md:leading-[0.85] tracking-tight uppercase text-center mb-10 md:mb-20 text-text-primary drop-shadow-[0_2px_10px_rgba(0,0,0,0.1)] transition-colors duration-700">
              CATALOG
            </h2>

            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 pointer-events-auto">
              {products.map((product, idx) => (
                <div
                  key={product.id}
                  className="group relative bg-bg-card border-2 border-border-card/85 hover:border-accent/80 rounded-2xl overflow-hidden transition-all duration-500 shadow-[0_12px_45px_rgba(0,0,0,0.15)] hover:shadow-3xl hover:-translate-y-2 flex flex-col pointer-events-auto"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-accent/0 via-accent/0 to-accent/0 group-hover:from-accent/5 group-hover:via-transparent group-hover:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0"></div>

                  {product.image_url && (
                    <div className="w-full h-64 overflow-hidden relative border-b border-border transition-colors duration-700 bg-bg-primary/40">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-70 z-10 pointer-events-none"></div>
                      <img
                        src={product.image_url}
                        alt={product.name_en}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover opacity-100 group-hover:scale-105 transition-all duration-500 ease-out relative z-0"
                      />
                      <div className="absolute top-4 left-4 z-20 bg-bg-card/95 backdrop-blur-md text-[10px] font-bold px-3 py-1 rounded-full border border-border-card text-text-primary shadow-sm transition-colors duration-700">
                        {String(idx + 1).padStart(2, "0")}
                      </div>
                    </div>
                  )}
                  <div className="p-8 flex flex-col flex-grow relative z-20">
                    <h3 className="text-2xl font-display uppercase tracking-wide text-text-primary group-hover:text-accent transition-colors duration-300">
                      {product.name_en}
                    </h3>
                    <div className="w-8 h-px bg-border group-hover:bg-accent/50 transition-colors duration-300 mt-4 mb-5"></div>
                    <p className="text-sm text-text-primary/80 group-hover:text-text-primary transition-colors duration-300 mt-2 mb-8 flex-grow leading-relaxed font-sans">
                      {product.description_en}
                    </p>

                    <div className="flex justify-between items-end mt-auto">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-widest text-text-primary/50 mb-1 font-bold transition-colors duration-700">
                          Price
                        </span>
                        <span className="text-accent text-3xl font-display leading-none transition-colors duration-700">
                          ${product.price}
                        </span>
                      </div>
                      <MagneticWrapper>
                        <button
                          onClick={() => handleAddToCart(product.id)}
                          disabled={addedIds[product.id]}
                          className={`relative overflow-hidden text-[11px] font-bold uppercase tracking-[0.2em] px-6 py-3 transition-colors duration-300 rounded-lg cursor-pointer ${addedIds[product.id] ? "bg-accent/20 border-accent/20 text-accent cursor-default" : "bg-text-primary text-bg-primary hover:bg-accent hover:text-bg-primary shadow-md hover:shadow-lg"}`}
                        >
                          <span className="relative z-10">
                            {addedIds[product.id] ? "Added" : "Add to Cart"}
                          </span>
                        </button>
                      </MagneticWrapper>
                    </div>
                  </div>
                </div>
              ))}

              {products.length === 0 && (
                <div className="col-span-full py-12 text-center text-text-muted border border-dashed border-border/50 bg-bg-primary/50 backdrop-blur-md rounded-2xl text-sm tracking-widest uppercase transition-colors duration-700">
                  Loading Products... Try restarting server.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* God-Mode Celestial Brutalist Footer */}
        <footer className="w-full bg-bg-inverted text-text-inverted py-20 md:py-28 px-6 md:px-16 pointer-events-auto transition-colors duration-700 relative z-30 overflow-hidden border-t border-text-primary/10">
          {/* Ambient noise & background detail */}
          <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 relative z-10">
            {/* LEFT: Kinetic Branding & Tactile Device Dial */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-12">
              <div className="flex flex-col gap-6">
                {/* Kinetic Brand Typography */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 font-display text-5xl md:text-7xl leading-none tracking-widest uppercase select-none">
                  <div className="flex gap-[2px]">
                    {"AESTHETE".split("").map((char, idx) => (
                      <motion.span
                        key={`a-${idx}`}
                        whileHover={{
                          y: -12,
                          scale: 1.15,
                          transition: {
                            type: "spring",
                            stiffness: 400,
                            damping: 10,
                          },
                        }}
                        className="inline-block cursor-pointer transition-colors duration-200 text-text-inverted hover:text-accent font-bold"
                      >
                        {char}
                      </motion.span>
                    ))}
                  </div>
                  <div className="flex gap-[2px]">
                    {"STUDIO".split("").map((char, idx) => (
                      <motion.span
                        key={`b-${idx}`}
                        whileHover={{
                          y: -12,
                          scale: 1.15,
                          transition: {
                            type: "spring",
                            stiffness: 400,
                            damping: 10,
                          },
                        }}
                        className="inline-block cursor-pointer transition-colors duration-200 text-text-inverted opacity-70 hover:opacity-100 hover:text-accent font-bold"
                      >
                        {char}
                      </motion.span>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] uppercase tracking-[0.25em] font-bold text-text-inverted opacity-50 max-w-sm mt-2 leading-relaxed">
                  PRECISE SPECIFICATION MECHANICS AND METICULOUSLY CRAFTED
                  OBJECT DESIGN TO PERFECT YOUR ENVIRONMENT.
                </p>
              </div>

              {/* Interactive Adaptive Sensory Micro-Simulator Widget */}
              <div className="bg-text-inverted/5 border border-text-inverted/10 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-3 right-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full animate-ping"></span>
                  <span className="text-[8px] font-mono tracking-widest text-[#ceb693] font-bold uppercase">
                    CRAFT CALIBRATOR v2.0
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 items-center">
                  {/* SVG Dial Gauge */}
                  <div className="relative w-28 h-28 flex-shrink-0">
                    <svg
                      className="w-full h-full transform -rotate-90"
                      viewBox="0 0 100 100"
                    >
                      {/* Outer Track */}
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        stroke="rgba(255, 255, 255, 0.08)"
                        strokeWidth="6"
                        fill="transparent"
                      />
                      {/* Colored calibration zones */}
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        stroke="#ceb693"
                        strokeWidth="6"
                        strokeDasharray="264"
                        strokeDashoffset={
                          productInfo.category === "coffee"
                            ? 264 - (264 * (simulatorValue2 || 0)) / 15
                            : productInfo.category === "watch"
                              ? 264 - (264 * (simulatorValue1 || 0)) / 320
                              : 264 - (264 * (simulatorValue2 || 0)) / 100
                        }
                        strokeLinecap="round"
                        fill="transparent"
                        className="transition-all duration-100 ease-out"
                      />
                    </svg>
                    {/* Centered needle indicator */}
                    <div
                      className="absolute inset-0 flex items-center justify-center transition-transform duration-100 ease-out"
                      style={{ transform: `rotate(${dialRotation - 90}deg)` }}
                    >
                      <div className="w-12 h-[2px] bg-accent origin-left rounded-full shadow-[0_0_8px_rgba(206,182,147,0.8)] -translate-x-1" />
                      <div className="w-3 h-3 rounded-full bg-text-primary border-2 border-accent absolute" />
                    </div>
                    {/* Digital Gauge value */}
                    <div className="absolute inset-x-0 bottom-2 text-center">
                      <span className="text-[10px] font-mono font-bold tracking-widest text-text-inverted opacity-80">
                        {productInfo.category === "coffee"
                          ? simulatorValue2 > 0
                            ? `${simulatorValue2} BAR`
                            : "0.0 BAR"
                          : productInfo.category === "watch"
                            ? simulatorValue2 > 0
                              ? `${simulatorValue2} ms`
                              : "— ms"
                            : `${simulatorValue2}%`}
                      </span>
                    </div>
                  </div>

                  {/* Controls & Streaming animation */}
                  <div className="flex-1 flex flex-col justify-center gap-3 w-full">
                    <div className="flex justify-between items-baseline border-b border-bg-primary/10 pb-2">
                      <span className="text-[10px] font-bold tracking-wider text-text-inverted opacity-45 uppercase">
                        {productInfo.category === "coffee"
                          ? "PRESSURE"
                          : productInfo.category === "watch"
                            ? "BEAT ERROR"
                            : productInfo.category === "glasses"
                              ? "UV BLOCK"
                              : productInfo.category === "book"
                                ? "GRID QUALITY"
                                : "INTEGRITY"}
                      </span>
                      <span className="text-[11px] font-mono font-bold tracking-widest text-accent uppercase">
                        {simulatorStatus}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono font-bold text-text-inverted opacity-70">
                      <div>
                        {productInfo.category === "coffee"
                          ? "YIELD:"
                          : productInfo.category === "watch"
                            ? "AMPLITUDE:"
                            : productInfo.category === "glasses"
                              ? "POLAR AXIS:"
                              : productInfo.category === "book"
                                ? "COLUMNS:"
                                : "QUALITY:"}{" "}
                        <span className="text-text-inverted font-mono">
                          {productInfo.category === "coffee"
                            ? simulatorValue1 > 0
                              ? `${simulatorValue1}g`
                              : "—"
                            : productInfo.category === "watch"
                              ? simulatorValue1 > 0
                                ? `${simulatorValue1}°`
                                : "—"
                              : productInfo.category === "glasses"
                                ? simulatorValue1 > 0
                                  ? `${simulatorValue1}°`
                                  : "—"
                                : productInfo.category === "book"
                                  ? simulatorValue1 > 0
                                    ? `${simulatorValue1} COLS`
                                    : "—"
                                  : `${simulatorValue1}`}
                        </span>
                      </div>
                      <div>
                        {productInfo.category === "coffee"
                          ? "TIME:"
                          : productInfo.category === "watch"
                            ? "BEAT RATE:"
                            : productInfo.category === "glasses"
                              ? "FILTERING:"
                              : productInfo.category === "book"
                                ? "LAYOUT:"
                                : "CHECK:"}{" "}
                        <span className="text-text-inverted font-mono">
                          {productInfo.category === "coffee"
                            ? simulatorTime > 0
                              ? `${simulatorTime}s`
                              : "—"
                            : productInfo.category === "watch"
                              ? "28,800 vph"
                              : productInfo.category === "glasses"
                                ? "UV400 COATING"
                                : productInfo.category === "book"
                                  ? "12-COL FLEX"
                                  : "A+ PASS"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 flex flex-col gap-2 w-full">
                      <button
                        onClick={() =>
                          !simulatorActive && setSimulatorActive(true)
                        }
                        disabled={simulatorActive}
                        className={`w-full px-4 py-2 border rounded-md text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${
                          simulatorActive
                            ? "border-accent/30 text-accent/50 bg-accent/5 cursor-default"
                            : "border-accent text-accent hover:bg-accent hover:text-bg-primary active:scale-95 shadow-md shadow-accent/10"
                        }`}
                      >
                        {simulatorActive
                          ? productInfo.category === "coffee"
                            ? "Extracting..."
                            : productInfo.category === "watch"
                              ? "Regulating..."
                              : productInfo.category === "glasses"
                                ? "Scanning..."
                                : productInfo.category === "book"
                                  ? "Compiling..."
                                  : "Validating..."
                          : productInfo.category === "coffee"
                            ? "PULL PERFECT SHOT"
                            : productInfo.category === "watch"
                              ? "CALIBRATE BEAT RATE"
                              : productInfo.category === "glasses"
                                ? "SCAN UV INTEGRITY"
                                : productInfo.category === "book"
                                  ? "COMPILE GRID SCHEMATA"
                                  : "VALIDATE SYSTEM"}
                      </button>

                      {/* Sensory active motion visuals */}
                      {simulatorActive && (
                        <div className="mt-2 flex justify-center items-center h-10 w-full overflow-hidden">
                          {productInfo.category === "coffee" && (
                            <div className="flex flex-col items-center gap-1">
                              <motion.div
                                animate={{ height: [4, 24, 4] }}
                                transition={{
                                  repeat: Infinity,
                                  duration: 0.8,
                                  ease: "easeInOut",
                                }}
                                className="w-[3px] bg-gradient-to-b from-accent to-[#8a6d45] rounded-full origin-top"
                              />
                              <div className="w-4 h-1 px-1 bg-[#8a6d45] rounded-t-full relative">
                                <span className="absolute -top-1 left-1.5 w-1 h-1 bg-accent rounded-full animate-ping"></span>
                              </div>
                            </div>
                          )}
                          {productInfo.category === "watch" && (
                            <div className="flex items-center gap-1.5 justify-center relative">
                              <motion.div
                                style={{ originY: 0.5, originX: 0.5 }}
                                animate={{ rotate: [-35, 35, -35] }}
                                transition={{
                                  repeat: Infinity,
                                  duration: 1.2,
                                  ease: "easeInOut",
                                }}
                                className="w-8 h-8 rounded-full border-2 border-dashed border-accent/40 flex items-center justify-center"
                              >
                                <div className="w-4 h-[2px] bg-accent" />
                              </motion.div>
                              <span className="text-[10px] uppercase font-mono tracking-widest text-accent font-bold animate-pulse">
                                TICK-TOCK
                              </span>
                            </div>
                          )}
                          {productInfo.category === "glasses" && (
                            <div className="relative w-full flex items-center justify-center gap-2">
                              <div className="absolute inset-0 bg-accent/5 rounded-lg blur-sm animate-pulse" />
                              <motion.div
                                animate={{ x: [-50, 50] }}
                                transition={{
                                  repeat: Infinity,
                                  duration: 1.5,
                                  ease: "linear",
                                }}
                                className="w-4 h-1 bg-accent relative"
                              />
                              <div className="w-8 h-4 rounded-full border border-text-inverted/30 relative flex items-center justify-center">
                                <div className="w-4 h-px bg-accent/60" />
                              </div>
                            </div>
                          )}
                          {productInfo.category === "book" && (
                            <div className="flex items-center gap-1 justify-center font-mono text-[9px] text-accent font-bold">
                              <span className="animate-pulse">
                                _COMPILING:{" "}
                              </span>
                              <span className="bg-accent/10 px-1 border border-accent/20 rounded font-bold font-mono">
                                {simulatorStatus}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CENTER: Quick Nav Links */}
            <div className="lg:col-span-3 grid grid-cols-2 gap-8 text-[11px] uppercase tracking-[0.2em] font-bold md:pt-4">
              <div className="flex flex-col gap-5">
                <span className="text-text-inverted opacity-30 tracking-[0.3em] font-extrabold text-[10px] mb-2">
                  Shop Vault
                </span>
                <a
                  href="#menu"
                  className="hover:text-accent transition-colors duration-300 flex items-center group gap-2"
                >
                  <span className="w-1 h-1 bg-accent rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></span>
                  <span>Collectibles</span>
                </a>
                <a
                  href="#menu"
                  className="hover:text-accent transition-colors duration-300 flex items-center group gap-2"
                >
                  <span className="w-1 h-1 bg-accent rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></span>
                  <span>Equipment</span>
                </a>
                <a
                  href="#menu"
                  className="hover:text-accent transition-colors duration-300 flex items-center group gap-2"
                >
                  <span className="w-1 h-1 bg-accent rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></span>
                  <span>Editions</span>
                </a>
              </div>
              <div className="flex flex-col gap-5">
                <span className="text-text-inverted opacity-30 tracking-[0.3em] font-extrabold text-[10px] mb-2">
                  Inquiry
                </span>
                <a
                  href="#"
                  className="hover:text-accent transition-colors duration-300 flex items-center group gap-2"
                >
                  <span className="w-1 h-1 bg-accent rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></span>
                  <span>Journal</span>
                </a>
                <a
                  href="#"
                  className="hover:text-accent transition-colors duration-300 flex items-center group gap-2"
                >
                  <span className="w-1 h-1 bg-accent rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></span>
                  <span>Contact</span>
                </a>
                <a
                  href="#"
                  className="hover:text-accent transition-colors duration-300 flex items-center group gap-2"
                >
                  <span className="w-1 h-1 bg-accent rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></span>
                  <span>Shipping</span>
                </a>
              </div>
            </div>

            {/* RIGHT: High End Newsletter Signup & Celestial Clock */}
            <div className="lg:col-span-4 flex flex-col justify-between gap-12 md:pt-4">
              <div className="flex flex-col gap-6">
                <span className="text-text-inverted opacity-30 tracking-[0.3em] font-extrabold text-[10px]">
                  COGNITIVE ARCHIVES
                </span>

                <AnimatePresence mode="wait">
                  {!newsletterSubmitted ? (
                    <motion.form
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (newsletterEmail) setNewsletterSubmitted(true);
                      }}
                      className="flex flex-col gap-3 w-full"
                    >
                      <p className="text-[11px] text-text-inverted opacity-60 uppercase tracking-widest font-bold leading-relaxed">
                        Subscribe for secret archives, early hardware
                        iterations, and limited product releases.
                      </p>
                      <div className="flex w-full border border-text-inverted/20 hover:border-accent focus-within:border-accent rounded-lg overflow-hidden transition-colors duration-300 bg-text-inverted/5">
                        <input
                          type="email"
                          required
                          placeholder="ENTER SECURE EMAIL"
                          value={newsletterEmail}
                          onChange={(e) => setNewsletterEmail(e.target.value)}
                          className="bg-transparent border-none outline-none flex-1 px-4 py-3 text-[11px] font-mono uppercase tracking-widest text-text-inverted placeholder-text-inverted/30 focus:ring-0 focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="px-6 bg-transparent hover:bg-accent border-l border-text-inverted/20 hover:border-accent text-text-inverted hover:text-bg-inverted text-[10px] font-bold tracking-widest uppercase transition-all duration-300 active:scale-95"
                        >
                          JOIN
                        </button>
                      </div>
                    </motion.form>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="border border-accent/40 bg-accent/5 rounded-xl p-5 flex flex-col gap-3 text-left relative overflow-hidden"
                    >
                      {/* Security stamp overlay */}
                      <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full border border-accent/10 flex items-center justify-center text-[8px] font-mono text-accent/20 rotate-12 select-none pointer-events-none">
                        APPROVED
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                          ✓
                        </div>
                        <span className="text-[11px] font-mono font-bold tracking-widest text-accent uppercase">
                          CONNECTION INSTANTIATED
                        </span>
                      </div>
                      <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-text-inverted opacity-70 leading-relaxed">
                        We have queued your terminal{" "}
                        <span className="text-accent underline font-mono">
                          {newsletterEmail}
                        </span>{" "}
                        for incoming dispatches. Welcome to the craft circle.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-text-inverted opacity-45 border-t border-text-inverted/10 pt-6">
                <div className="flex flex-col gap-1">
                  <span className="text-text-inverted opacity-30 text-[8px]">
                    BRAND CODES
                  </span>
                  <span className="text-text-inverted opacity-60">CONCEPT — © 2026</span>
                </div>

                <button
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                  className="group text-[10px] text-accent tracking-[0.25em] flex items-center gap-3 hover:text-text-inverted transition-colors duration-300"
                >
                  <span className="border border-accent rounded-full w-7 h-7 flex items-center justify-center group-hover:bg-accent group-hover:text-text-primary transition-all duration-300 group-hover:-translate-y-1">
                    ↑
                  </span>
                  <span>TOP OF STREAM</span>
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-bg-primary/50 backdrop-blur-sm z-[100] pointer-events-auto"
              onClick={() => setIsCartOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-bg-primary border-l border-border/50 shadow-2xl z-[101] flex flex-col pointer-events-auto text-text-primary"
            >
              <div className="flex items-center justify-between p-6 md:p-8 border-b border-border/50 bg-bg-primary/80 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-accent"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <path d="M3 6h18" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                  <h2 className="font-display tracking-[0.2em] text-lg uppercase">
                    Order Summary
                  </h2>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-10 h-10 rounded-full border border-border/50 flex items-center justify-center hover:border-accent hover:text-accent transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-text-muted">
                    <svg
                      className="w-16 h-16 mb-4 opacity-50"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      viewBox="0 0 24 24"
                    >
                      <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <div className="text-[10px] font-bold tracking-[0.2em] uppercase mb-2">
                      Cart is empty
                    </div>
                    <p className="text-sm border border-dashed border-border/50 px-6 py-3 rounded-lg backdrop-blur-sm shadow-sm inline-block">
                      Curate your selection
                    </p>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 group">
                      <div className="w-24 h-24 bg-bg-primary/50 rounded-xl overflow-hidden border border-border/50 relative shadow-sm transition-colors duration-300 flex-shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/20 to-transparent z-10 pointer-events-none"></div>
                        <img
                          src={item.image_url}
                          alt={item.name_en}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-display tracking-widest uppercase text-sm group-hover:text-accent transition-colors line-clamp-1">
                            {item.name_en}
                          </h3>
                          <button
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="text-text-muted hover:text-red-500 transition-colors p-1 flex-shrink-0"
                            title="Remove"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                        <div className="text-[10px] text-text-muted uppercase tracking-widest mb-3">
                          {productInfoMap[item.name_en]?.category || "product"}
                        </div>
                        <div className="text-accent font-display tracking-widest">
                          ${item.price}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="p-6 md:p-8 bg-bg-primary/80 backdrop-blur-lg border-t border-border/50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                  <div className="flex justify-between items-center mb-6 text-sm font-semibold tracking-wider">
                    <span className="uppercase text-text-muted">Subtotal</span>
                    <span className="font-display text-2xl text-text-primary">
                      ${cartSubtotal.toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={handleProceedToCheckout}
                    disabled={checkoutStatus === "loading"}
                    className="w-full relative overflow-hidden group bg-accent text-bg-primary py-4 rounded-xl font-display tracking-[0.2em] uppercase text-sm hover:shadow-lg hover:shadow-accent/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span className="relative z-10 font-bold">
                      {checkoutStatus === "loading" ? "Securing Session..." : "Proceed to Checkout"}
                    </span>
                    <span className="absolute inset-0 bg-bg-inverted/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none"></span>
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Premium Customer Authenticity Vault (Auth Modal) */}
      <AnimatePresence>
        {isAuthOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsAuthOpen(false);
                if (isSoundEnabled) playTick();
              }}
              className="absolute inset-0 bg-bg-primary/95 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-[420px] bg-bg-primary border border-border/60 p-8 rounded-2xl shadow-xl flex flex-col pointer-events-auto text-text-primary z-10"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setAuthError(null);
                  setIsAuthOpen(false);
                  if (isSoundEnabled) playTick();
                }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full border border-border/40 flex items-center justify-center text-text-muted hover:text-accent hover:border-accent/60 transition-colors cursor-pointer"
              >
                ✕
              </button>

              <div className="text-center mb-6">
                <span className="text-[10px] font-mono tracking-[0.25em] text-accent uppercase font-bold">
                  PREMIUM SIGN IN
                </span>
                <h3 className="text-2xl font-display uppercase tracking-widest mt-1 text-text-primary">
                  {authMode === "login" ? "Sign In" : "Create Account"}
                </h3>
                <p className="text-[11px] text-text-muted tracking-wider mt-2 max-w-[285px] mx-auto leading-relaxed">
                  Sign in to build your cart, customize items, and easily checkout with Stripe.
                </p>
              </div>

              {/* Visual Error Feedback Banner */}
              {authError && (
                <div id="auth-error-banner" className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3.5 rounded-xl text-center font-sans font-medium transition-all duration-300">
                  {authError}
                </div>
              )}

              {/* Form Handling */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setAuthError(null);
                  const target = e.target as HTMLFormElement;
                  const email = (target.elements.namedItem("email") as HTMLInputElement).value;
                  const password = (target.elements.namedItem("password") as HTMLInputElement).value;
                  const name = authMode === "register" ? (target.elements.namedItem("name") as HTMLInputElement)?.value : undefined;

                  if (authMode === "register") {
                    const passAnalysis = analyzePassword(password);
                    if (passAnalysis.score < 2) {
                      setAuthError("For your absolute digital security, please make your password stronger. Refer to the real-time advice card to add characters, mixed case, numbers, or symbols.");
                      return;
                    }
                  }

                  try {
                    const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/register";
                    const response = await fetch(endpoint, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email, password, name }),
                    });
                    
                    const responseText = await response.text();
                    let data;
                    try {
                      data = JSON.parse(responseText);
                    } catch (parseError) {
                      console.error("Unexpected response body format:", responseText);
                      setAuthError("Authentication system returned response with invalid format. Please try again.");
                      return;
                    }

                    if (data.success) {
                      setUser(data.user);
                      localStorage.setItem("ae_vault_session", JSON.stringify(data.user));
                      setIsAuthOpen(false);
                      if (isSoundEnabled) playChime();
                    } else {
                      setAuthError(data.error || "Authentication rejected. Please check your inputs.");
                    }
                  } catch (err) {
                    console.error("Auth submit failed:", err);
                    setAuthError("Authentication service is currently offline. Please try again.");
                  }
                }}
                className="space-y-4 font-sans text-left w-full"
              >
                {authMode === "register" && (
                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[9px] font-mono tracking-widest text-text-muted uppercase font-bold">
                      Your Name
                    </label>
                    <input
                      name="name"
                      type="text"
                      required
                      placeholder="e.g. Jean Dupont"
                      className="w-full bg-bg-primary border border-border/80 rounded-lg px-4 py-3 text-xs tracking-wider focus:border-accent text-text-primary placeholder:text-text-muted/40 outline-none transition-colors"
                    />
                  </div>
                )}

                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[9px] font-mono tracking-widest text-text-muted uppercase font-bold">
                    Email Address
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="name@domain.com"
                    className="w-full bg-bg-primary border border-border/80 rounded-lg px-4 py-3 text-xs tracking-wider focus:border-accent text-text-primary placeholder:text-text-muted/40 outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[9px] font-mono tracking-widest text-text-muted uppercase font-bold flex justify-between items-center">
                    <span>Password</span>
                    {authMode === "register" && registerPassword && (
                      <span className={`text-[9.5px] font-semibold uppercase tracking-wider font-mono ${passwordAnalysis.textColor}`}>
                        {passwordAnalysis.label}
                      </span>
                    )}
                  </label>
                  <input
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="w-full bg-bg-primary border border-border/80 rounded-lg px-4 py-3 text-xs tracking-wider focus:border-accent text-text-primary placeholder:text-text-muted/40 outline-none transition-colors"
                  />

                  {/* Password Strength Parameters, Meter & Advices */}
                  {authMode === "register" && registerPassword && (
                    <div className="mt-3 space-y-3 bg-bg-card/45 border border-border-card/50 rounded-xl p-3.5 transition-all duration-300">
                      {/* Meter bar blocks */}
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[9px] font-mono text-text-muted uppercase">Strength Meter</span>
                          <span className="text-[10px] font-sans font-medium text-text-primary">
                            {registerPassword ? `${Math.min(100, Math.round((passwordAnalysis.score / 4) * 100))}%` : "0%"}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full bg-bg-primary/50 rounded-full overflow-hidden p-0.5 border border-border/30">
                          <div className={`h-full rounded-sm transition-all duration-500 ${passwordAnalysis.score >= 1 ? passwordAnalysis.color : "bg-bg-primary/20"}`} />
                          <div className={`h-full rounded-sm transition-all duration-500 ${passwordAnalysis.score >= 2 ? passwordAnalysis.color : "bg-bg-primary/20"}`} />
                          <div className={`h-full rounded-sm transition-all duration-500 ${passwordAnalysis.score >= 3 ? passwordAnalysis.color : "bg-bg-primary/20"}`} />
                          <div className={`h-full rounded-sm transition-all duration-500 ${passwordAnalysis.score >= 4 ? passwordAnalysis.color : "bg-bg-primary/20"}`} />
                        </div>
                      </div>

                      {/* Criteria parameters check */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-sans">
                        <div className="flex items-center gap-2">
                          {passwordAnalysis.checks.length ? (
                            <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border border-border shrink-0 flex items-center justify-center text-[7px] text-text-muted bg-bg-primary/10">○</div>
                          )}
                          <span className={passwordAnalysis.checks.length ? "text-text-primary/90 font-medium font-sans" : "text-text-muted/80 font-sans"}>8+ Characters</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {passwordAnalysis.checks.upper && passwordAnalysis.checks.lower ? (
                            <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border border-border shrink-0 flex items-center justify-center text-[7px] text-text-muted bg-bg-primary/10">○</div>
                          )}
                          <span className={passwordAnalysis.checks.upper && passwordAnalysis.checks.lower ? "text-text-primary/90 font-medium font-sans" : "text-text-muted/80 font-sans"}>A/a Case Mix</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {passwordAnalysis.checks.number ? (
                            <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border border-border shrink-0 flex items-center justify-center text-[7px] text-text-muted bg-bg-primary/10">○</div>
                          )}
                          <span className={passwordAnalysis.checks.number ? "text-text-primary/90 font-medium font-sans" : "text-text-muted/80 font-sans"}>Numbers (0-9)</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {passwordAnalysis.checks.symbol ? (
                            <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border border-border shrink-0 flex items-center justify-center text-[7px] text-text-muted bg-bg-primary/10">○</div>
                          )}
                          <span className={passwordAnalysis.checks.symbol ? "text-text-primary/90 font-medium font-sans" : "text-text-muted/80 font-sans"}>Special Symbol</span>
                        </div>
                      </div>

                      {/* Custom Advice */}
                      <div className="text-[10px] bg-bg-primary/60 rounded-lg p-3 border border-border/30 text-text-muted font-sans leading-relaxed transition-all duration-300">
                        {passwordAnalysis.advice}
                      </div>

                      {/* Ultra secure bonus badge */}
                      {passwordAnalysis.checks.lengthUltra && (
                        <div className="flex items-center justify-center gap-1.5 py-1 px-2.5 bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-mono tracking-widest uppercase text-emerald-400 rounded-full text-center">
                          <svg className="w-3 h-3 text-emerald-400 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.8-9.8a1 1 0 00-1.6-1.2L9 11.2l-1.2-1.2a1 1 0 00-1.6 1.4l2 2a1 1 0 001.6 0l4-4.8z" clipRule="evenodd" />
                          </svg>
                          <span>Ultra-Length Security Active</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isGoogleLoading}
                  className="w-full bg-accent text-bg-primary py-3.5 rounded-lg font-sans text-xs tracking-[0.2em] uppercase font-bold hover:bg-bg-inverted hover:text-text-inverted active:scale-[0.98] transition-all cursor-pointer mt-2 disabled:opacity-50"
                >
                  {authMode === "login" ? "Sign In" : "Sign Up"}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5 w-full">
                <span className="flex-1 h-[1px] bg-border/40" />
                <span className="text-[9px] font-mono tracking-widest text-text-muted uppercase">
                  OR CONTINUE WITH
                </span>
                <span className="flex-1 h-[1px] bg-border/40" />
              </div>

              {/* Google Sign In Button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full bg-transparent border border-border flex items-center justify-center gap-3 py-3 rounded-lg text-xs font-semibold tracking-wider hover:border-accent hover:text-accent transition-all cursor-pointer disabled:opacity-50"
                type="button"
              >
                {isGoogleLoading ? (
                  <span className="text-[11px] font-mono tracking-widest uppercase">Initializing...</span>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>

              {/* Mode switch helper */}
              <div className="mt-5 text-center text-[10.5px]">
                <span className="text-text-muted mr-1.5">
                  {authMode === "login" ? "Don't have an account?" : "Already have an account?"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthError(null);
                    setAuthMode(authMode === "login" ? "register" : "login");
                    setRegisterPassword("");
                    if (isSoundEnabled) playTick();
                  }}
                  className="text-accent underline font-mono uppercase tracking-widest hover:text-text-primary transition-colors cursor-pointer bg-transparent border-none p-0 outline-none"
                >
                  {authMode === "login" ? "Sign Up" : "Sign In"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Luxury Sandbox Transaction Receipt / Confirmation Dashboard */}
      <AnimatePresence>
        {checkoutStatus === "success" && checkoutOrderDetails && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setCheckoutStatus("idle");
                setCheckoutOrderDetails(null);
                if (isSoundEnabled) playTick();
              }}
              className="absolute inset-0 bg-bg-primary/95 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="relative w-full max-w-[480px] bg-bg-primary border border-accent/30 p-8 rounded-2xl shadow-2xl flex flex-col pointer-events-auto text-text-primary z-10 text-center overflow-hidden"
            >
              {/* Subtle Ambient gold beam vector */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent/20 via-accent to-accent/20" />

              <div className="w-16 h-16 bg-accent/10 border border-accent/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-accent"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <span className="text-[10px] font-mono tracking-[0.3em] text-accent uppercase font-bold">
                ACQUISITION LOGGED
              </span>
              <h2 className="text-3xl font-display uppercase tracking-widest mt-2">{checkoutOrderDetails?.isStripeReal ? "Card Charged" : "Sandbox Acquired"}</h2>
              <p className="text-xs text-text-muted mt-3 mb-8 tracking-wider max-w-[340px] mx-auto leading-relaxed">
                Your luxury conceptual objects are being calibrated. A secure, cryptographic verification receipt has been compiled inside your vault.
              </p>

              {/* Receipt Details Box */}
              <div className="bg-bg-primary/40 border border-border/80 rounded-xl p-5 text-left space-y-3.5 mb-8 font-mono text-[11px] tracking-wide relative">
                <div className="flex justify-between items-center text-text-muted border-b border-border/40 pb-2 pb-2">
                  <span>PARAMETER</span>
                  <span>RECORDED SPEC</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-muted uppercase">Vault Session:</span>
                  <span className="text-text-primary font-sans font-medium text-xs">{user?.name || "Guest Citizen"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-muted uppercase">Receipt ID:</span>
                  <span className="text-text-primary uppercase text-xs">{checkoutOrderDetails?.orderId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-muted uppercase">System Token:</span>
                  <span className="text-text-primary truncate max-w-[160px] text-xs">{checkoutOrderDetails?.secureHash}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-muted uppercase">Route Gate:</span>
                  <span className="text-accent uppercase text-xs">{checkoutOrderDetails?.isStripeReal ? "Stripe Live" : "Sandbox Core"}</span>
                </div>
                <div className="flex justify-between items-center border-t border-border/40 pt-3">
                  <span className="text-text-muted font-bold uppercase">STATUS:</span>
                  <span className="text-emerald-500 font-bold uppercase tracking-widest text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                    ACQUIRED
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setCheckoutStatus("idle");
                  setCheckoutOrderDetails(null);
                  if (isSoundEnabled) playTick();
                }}
                className="w-full bg-accent text-bg-primary py-4 rounded-xl font-display tracking-[0.25em] uppercase text-xs font-bold hover:bg-bg-inverted hover:text-text-inverted transition-all cursor-pointer"
              >
                Return to Gallery
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Real-time Interactive Simulated Stripe Sheet */}
      <AnimatePresence>
        {isSimulatedStripeOpen && simulatedStripeDetails && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsSimulatedStripeOpen(false);
                setSimulatedStripeDetails(null);
                if (isSoundEnabled) playTick();
              }}
              className="absolute inset-0 bg-bg-primary/95 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: "spring", duration: 0.55 }}
              className="relative w-full max-w-[500px] bg-bg-primary border border-border p-6 rounded-2xl shadow-2xl flex flex-col pointer-events-auto text-text-primary z-10 overflow-hidden"
            >
              <button
                onClick={() => {
                  setIsSimulatedStripeOpen(false);
                  setSimulatedStripeDetails(null);
                  if (isSoundEnabled) playTick();
                }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full border border-border/40 flex items-center justify-center text-text-muted hover:text-accent hover:border-accent/60 transition-colors cursor-pointer"
              >
                ✕
              </button>

              <div className="text-center mb-5">
                <span className="text-[10px] font-mono tracking-[0.3em] text-accent uppercase font-bold flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                  SECURE MOCK CHECKOUT GATEWAY
                </span>
                <h3 className="text-xl font-display uppercase tracking-widest mt-1 text-text-primary">
                  Vault Payment Auth
                </h3>
              </div>

              {/* Total Summary */}
              <div className="bg-bg-primary/50 border border-border/80 rounded-xl p-4 flex justify-between items-center mb-5 font-mono text-[11px] tracking-wide">
                <div className="text-left">
                  <p className="text-text-muted uppercase text-[9px] font-bold">TOTAL ACQUISITION SUBSTANCE</p>
                  <p className="text-sm font-sans font-black text-text-primary mt-1">
                    {cartItems.length} {cartItems.length === 1 ? "Aesthete Object" : "Aesthete Objects"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-text-muted uppercase text-[9px] font-bold">ORDER VALUE</p>
                  <p className="text-lg font-sans font-black text-accent mt-0.5">${cartSubtotal.toFixed(2)}</p>
                </div>
              </div>

              {/* Interactive 3D Card Graphic */}
              <div className="perspective-1000 w-full flex justify-center mb-6">
                <div
                  onMouseMove={(e) => {
                    const card = e.currentTarget;
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const rotateY = ((x / rect.width) - 0.5) * 24;
                    const rotateX = -((y / rect.height) - 0.5) * 24;
                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
                  }}
                  className={`w-full max-w-[340px] h-48 rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700/60 p-5 text-white flex flex-col justify-between shadow-xl transition-transform duration-300 preserve-3d cursor-default relative ${
                    focusedOnCvc ? "rotate-y-180" : ""
                  }`}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Front Side */}
                  <div className={`absolute inset-0 p-5 flex flex-col justify-between backface-hidden ${focusedOnCvc ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                    <div className="flex justify-between items-start">
                      {/* Chip */}
                      <div className="w-9 h-7 bg-amber-500/30 border border-amber-500/40 rounded-md flex items-center justify-center overflow-hidden">
                        <div className="w-5 h-4 border border-amber-500/20 rounded grid grid-cols-3 gap-[1px] p-[2px]">
                          <div className="bg-amber-500/10" />
                          <div className="bg-amber-500/20" />
                          <div className="bg-amber-500/10" />
                        </div>
                      </div>
                      
                      {/* Brand name */}
                      <span className="text-[10px] font-mono tracking-[0.25em] text-neutral-400 font-bold uppercase shrink-0">
                        {stripeFormInput.cardNumber.startsWith("4") ? "VISA" :
                         stripeFormInput.cardNumber.startsWith("5") ? "MASTERCARD" :
                         stripeFormInput.cardNumber.startsWith("3") ? "AMEX" : "CONCEPT CARD"}
                      </span>
                    </div>

                    {/* Card Number */}
                    <div className="text-lg font-mono tracking-[0.15em] text-neutral-100 text-center my-1 select-none">
                      {stripeFormInput.cardNumber || "•••• •••• •••• ••••"}
                    </div>

                    <div className="flex justify-between items-end">
                      <div className="min-w-0 flex-1 mr-3 text-left">
                        <p className="text-[8px] font-mono uppercase tracking-widest text-neutral-500 font-bold">Holder</p>
                        <p className="text-[10px] font-mono uppercase text-neutral-200 truncate font-semibold tracking-wider">
                          {stripeFormInput.name || "AESTHETE CITIZEN"}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[8px] font-mono uppercase tracking-widest text-neutral-500 font-bold">Expiry</p>
                        <p className="text-[10px] font-mono text-neutral-200 font-bold tracking-wider">
                          {stripeFormInput.expiry || "MM/YY"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Back Side */}
                  <div className={`absolute inset-0 p-5 flex flex-col justify-between backface-hidden rotate-y-180 ${focusedOnCvc ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                    <div className="w-full h-8 bg-neutral-950 -mx-5 mt-2" />
                    <div>
                      <div className="h-6 w-full bg-neutral-700 rounded flex justify-end items-center px-3">
                        <span className="text-neutral-900 font-mono text-xs font-bold font-italic bg-white px-2 py-0.5 rounded">
                          {stripeFormInput.cvc || "•••"}
                        </span>
                      </div>
                      <p className="text-[7px] font-mono text-neutral-500 tracking-wider text-right uppercase mt-1">Authorized Sandbox Security Signature Panel</p>
                    </div>
                    <div className="flex justify-between items-center text-[7px] font-mono text-neutral-600 uppercase">
                      <span>SECURE VAULT</span>
                      <span>AMB-V9</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error block */}
              {stripeFormError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-[11px] p-3 rounded-lg text-center font-mono mb-4">
                  {stripeFormError}
                </div>
              )}

              {/* Card form */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setStripeFormError(null);

                  const { cardNumber, expiry, cvc, name } = stripeFormInput;
                  if (!cardNumber || cardNumber.length < 15) {
                    setStripeFormError("Credit card number appears incomplete.");
                    return;
                  }
                  if (!expiry || !expiry.includes("/")) {
                    setStripeFormError("Provide card expiration details (MM/YY).");
                    return;
                  }
                  if (!cvc || cvc.length < 3) {
                    setStripeFormError("Provide card CVV security unlock digits.");
                    return;
                  }
                  if (!name) {
                    setStripeFormError("Cardholder authorization name is required.");
                    return;
                  }

                  setIsStagingPayment(true);
                  if (isSoundEnabled) playTick();

                  // 1800ms premium processing countdown delay
                  await new Promise((resolve) => setTimeout(resolve, 1800));

                  if (cardNumber.replace(/\s+/g, "") === "4000000000000000") {
                    setStripeFormError("Payment Declined: Secure gateway rejected mock session. Specify another card or sandbox test number.");
                    setIsStagingPayment(false);
                    return;
                  }

                  // Complete Checkout and open receipt
                  setIsSimulatedStripeOpen(false);
                  setCheckoutOrderDetails({
                    orderId: simulatedStripeDetails.orderId,
                    secureHash: simulatedStripeDetails.secureHash,
                    paymentMethod: "Concept " + (cardNumber.startsWith("4") ? "Visa" : cardNumber.startsWith("5") ? "Mastercard" : "Aesthete Card"),
                    isStripeReal: false,
                  });
                  setCheckoutStatus("success");
                  setAddedIds({});
                  setIsStagingPayment(false);
                  if (isSoundEnabled) playSuccess();
                  setCustomAlert({ message: "Transaction processed successfully via secure concept gateway.", type: "success" });
                }}
                className="space-y-4"
              >
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[9px] font-mono tracking-widest text-text-muted uppercase font-bold">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    required
                    value={stripeFormInput.name}
                    placeholder="e.g. Jean Dupont"
                    onChange={(e) => setStripeFormInput(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-bg-primary border border-border rounded-lg px-4 py-2.5 text-xs tracking-wider focus:border-accent text-text-primary outline-none transition-colors placeholder:text-text-muted/40"
                  />
                </div>

                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[9px] font-mono tracking-widest text-text-muted uppercase font-bold">
                    Card Number
                  </label>
                  <input
                    type="text"
                    required
                    value={stripeFormInput.cardNumber}
                    placeholder="4000 1234 5678 9010"
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/\D/g, "").slice(0, 16);
                      const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
                      setStripeFormInput(p => ({ ...p, cardNumber: formatted }));
                    }}
                    className="w-full bg-bg-primary border border-border rounded-lg px-4 py-2.5 text-xs tracking-wider focus:border-accent text-text-primary outline-none transition-colors font-mono placeholder:text-text-muted/40"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[9px] font-mono tracking-widest text-text-muted uppercase font-bold">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      value={stripeFormInput.expiry}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/\D/g, "").slice(0, 4);
                        let formatted = cleaned;
                        if (cleaned.length > 2) {
                          formatted = cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
                        }
                        setStripeFormInput(p => ({ ...p, expiry: formatted }));
                      }}
                      className="w-full bg-bg-primary border border-border rounded-lg px-4 py-2.5 text-xs tracking-wider focus:border-accent text-text-primary outline-none transition-colors font-mono placeholder:text-text-muted/40"
                    />
                  </div>

                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[9px] font-mono tracking-widest text-text-muted uppercase font-bold">
                      CVV Code
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="•••"
                      maxLength={4}
                      value={stripeFormInput.cvc}
                      onFocus={() => setFocusedOnCvc(true)}
                      onBlur={() => setFocusedOnCvc(false)}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/\D/g, "").slice(0, 4);
                        setStripeFormInput(p => ({ ...p, cvc: cleaned }));
                      }}
                      className="w-full bg-bg-primary border border-border rounded-lg px-4 py-2.5 text-xs tracking-wider focus:border-accent text-text-primary outline-none transition-colors font-mono placeholder:text-text-muted/40"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isStagingPayment}
                  className="w-full bg-accent text-bg-primary py-4 rounded-xl font-display tracking-[0.2em] uppercase text-xs font-bold hover:bg-bg-inverted hover:text-text-inverted active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                >
                  {isStagingPayment ? (
                    <span className="flex items-center gap-2 font-mono text-[10.5px]">
                      <svg className="animate-spin h-4.5 w-4.5 text-bg-primary" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Verifying Concept Auth...
                    </span>
                  ) : (
                    <span>Authorize Payment — ${cartSubtotal.toFixed(2)}</span>
                  )}
                </button>
              </form>

              {/* Developer Environment bridge explanation */}
              <div className="mt-5 border-t border-border/40 pt-4 text-left flex gap-3 text-text-muted">
                <svg className="w-5 h-5 text-accent shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                <div className="text-[10px] leading-relaxed tracking-wide">
                  <p className="font-mono text-accent uppercase font-black mb-1">Production Gateway Link</p>
                  To charge real live credit cards, assign <code className="bg-bg-secondary px-1 rounded text-accent font-mono">STRIPE_SECRET_KEY</code> inside User Secrets. When loaded, checkout automatically routes directly to standard Stripe checkout. Type <code className="bg-bg-secondary px-1 rounded text-accent font-mono">4000 0000 0000 0000</code> to test card declines.
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Luxury Vault Logout Confirmation Overlay */}
      <AnimatePresence>
        {logoutConfirmOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setLogoutConfirmOpen(false); if (isSoundEnabled) playTick(); }}
              className="absolute inset-0 bg-bg-primary/95 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-[380px] bg-bg-primary border border-border/80 p-8 rounded-2xl shadow-2xl flex flex-col pointer-events-auto text-text-primary z-10 text-center"
            >
              <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </div>
              <span className="text-[10px] font-mono tracking-[0.25em] text-red-500 uppercase font-bold">
                SECURE LOGOUT GATEWAY
              </span>
              <h3 className="text-xl font-display uppercase tracking-widest mt-2">
                Disconnect Session?
              </h3>
              <p className="text-[11.5px] text-text-muted mt-2.5 mb-6 tracking-wide leading-relaxed">
                Do you wish to secure your Aesthete Customer Vault session? All pending session states will be safely encrypted and completed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => { setLogoutConfirmOpen(false); if (isSoundEnabled) playTick(); }}
                  className="flex-1 border border-border py-3 rounded-lg text-xs font-mono uppercase tracking-wider hover:border-text-primary transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setUser(null);
                    localStorage.removeItem("ae_vault_session");
                    setLogoutConfirmOpen(false);
                    if (isSoundEnabled) playChime();
                    setCustomAlert({ message: "Session successfully locked and signed out.", type: "info" });
                  }}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-sans py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification HUD */}
      <AnimatePresence>
        {customAlert && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-[120] max-w-sm bg-bg-primary border border-border/80 rounded-xl p-4 shadow-2xl flex items-start gap-3.5 backdrop-blur-md"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              customAlert.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
              customAlert.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
              'bg-accent/10 text-accent border border-accent/20'
            }`}>
              {customAlert.type === 'error' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              ) : customAlert.type === 'success' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              )}
            </div>
            <div className="text-left">
              <p className="text-[9px] font-mono tracking-wider uppercase text-text-muted font-bold mb-0.5">
                {customAlert.type === 'error' ? 'System Warning' : customAlert.type === 'success' ? 'Transaction Clear' : 'Session Notice'}
              </p>
              <p className="text-[12px] text-text-primary tracking-wide leading-relaxed font-sans">{customAlert.message}</p>
            </div>
            <button 
              onClick={() => { if (isSoundEnabled) playTick(); setCustomAlert(null); }}
              className="text-text-muted hover:text-text-primary text-[10px] ml-1 font-mono transition-colors shrink-0"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
