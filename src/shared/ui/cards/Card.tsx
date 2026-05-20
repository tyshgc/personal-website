import { Content } from "./Content";
import { Description } from "./Description";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Root } from "./Root";
import { Title } from "./Title";

export const Card = Object.assign(Root, {
  Header,
  Title,
  Description,
  Content,
  Footer,
});
