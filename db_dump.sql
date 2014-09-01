--
-- PostgreSQL database dump
--

-- Dumped from database version 9.3.5
-- Dumped by pg_dump version 9.3.5
-- Started on 2014-09-01 16:12:07 CEST

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- TOC entry 182 (class 3079 OID 11799)
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- TOC entry 2052 (class 0 OID 0)
-- Dependencies: 182
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

--
-- TOC entry 195 (class 1255 OID 16536)
-- Name: bytea_import(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION bytea_import(p_path text, OUT p_result bytea) RETURNS bytea
    LANGUAGE plpgsql
    AS $$
declare
  l_oid oid;
  r record;
begin
  p_result := '';
  select lo_import(p_path) into l_oid;
  for r in ( select data 
             from pg_largeobject 
             where loid = l_oid 
             order by pageno ) loop
    p_result = p_result || r.data;
  end loop;
  perform lo_unlink(l_oid);
end;$$;


ALTER FUNCTION public.bytea_import(p_path text, OUT p_result bytea) OWNER TO postgres;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- TOC entry 170 (class 1259 OID 16689)
-- Name: images; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE images (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    img_svg text,
    img_png bytea,
    actual_size integer
);


ALTER TABLE public.images OWNER TO postgres;

--
-- TOC entry 171 (class 1259 OID 16695)
-- Name: images_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE images_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.images_id_seq OWNER TO postgres;

--
-- TOC entry 2053 (class 0 OID 0)
-- Dependencies: 171
-- Name: images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE images_id_seq OWNED BY images.id;


--
-- TOC entry 172 (class 1259 OID 16697)
-- Name: projects; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE projects (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    description character varying(355),
    width double precision,
    ignore_segments integer[],
    default_template json
);


ALTER TABLE public.projects OWNER TO postgres;

--
-- TOC entry 173 (class 1259 OID 16703)
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE projects_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.projects_id_seq OWNER TO postgres;

--
-- TOC entry 2054 (class 0 OID 0)
-- Dependencies: 173
-- Name: projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE projects_id_seq OWNED BY projects.id;


--
-- TOC entry 174 (class 1259 OID 16705)
-- Name: segment_types; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE segment_types (
    id integer NOT NULL,
    name character varying(50),
    description character varying(355),
    rules json,
    category integer
);


ALTER TABLE public.segment_types OWNER TO postgres;

--
-- TOC entry 175 (class 1259 OID 16711)
-- Name: segment_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE segment_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.segment_types_id_seq OWNER TO postgres;

--
-- TOC entry 2055 (class 0 OID 0)
-- Dependencies: 175
-- Name: segment_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE segment_types_id_seq OWNED BY segment_types.id;


--
-- TOC entry 176 (class 1259 OID 16713)
-- Name: segments; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE segments (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    description character varying(355),
    available boolean,
    type integer,
    image_id bigint,
    image_top_id bigint,
    image_ground_id bigint,
    min_width integer,
    max_width integer,
    standard_width integer
);


ALTER TABLE public.segments OWNER TO postgres;

--
-- TOC entry 2056 (class 0 OID 0)
-- Dependencies: 176
-- Name: COLUMN segments.image_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN segments.image_id IS 'ID des Bildes zur Frontal- und Thumbnaildarstellung';


--
-- TOC entry 2057 (class 0 OID 0)
-- Dependencies: 176
-- Name: COLUMN segments.image_top_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN segments.image_top_id IS 'ID des Bildes für Vogelperspektive';


--
-- TOC entry 2058 (class 0 OID 0)
-- Dependencies: 176
-- Name: COLUMN segments.image_ground_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN segments.image_ground_id IS 'ID des Bildes für Darstellung des Bodens';


--
-- TOC entry 177 (class 1259 OID 16716)
-- Name: segments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE segments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.segments_id_seq OWNER TO postgres;

--
-- TOC entry 2059 (class 0 OID 0)
-- Dependencies: 177
-- Name: segments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE segments_id_seq OWNED BY segments.id;


--
-- TOC entry 178 (class 1259 OID 16718)
-- Name: user_templates; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE user_templates (
    id integer NOT NULL,
    project_id integer NOT NULL,
    user_id integer,
    template json
);


ALTER TABLE public.user_templates OWNER TO postgres;

--
-- TOC entry 179 (class 1259 OID 16724)
-- Name: user_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE user_templates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_templates_id_seq OWNER TO postgres;

--
-- TOC entry 2060 (class 0 OID 0)
-- Dependencies: 179
-- Name: user_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE user_templates_id_seq OWNED BY user_templates.id;


--
-- TOC entry 180 (class 1259 OID 16726)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE users (
    id integer NOT NULL,
    name character varying(50),
    email character varying(80),
    password character varying,
    superuser boolean DEFAULT false
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 181 (class 1259 OID 16732)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 2061 (class 0 OID 0)
-- Dependencies: 181
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE users_id_seq OWNED BY users.id;


--
-- TOC entry 1907 (class 2604 OID 16734)
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY images ALTER COLUMN id SET DEFAULT nextval('images_id_seq'::regclass);


--
-- TOC entry 1908 (class 2604 OID 16735)
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY projects ALTER COLUMN id SET DEFAULT nextval('projects_id_seq'::regclass);


--
-- TOC entry 1909 (class 2604 OID 16736)
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY segment_types ALTER COLUMN id SET DEFAULT nextval('segment_types_id_seq'::regclass);


--
-- TOC entry 1910 (class 2604 OID 16737)
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY segments ALTER COLUMN id SET DEFAULT nextval('segments_id_seq'::regclass);


--
-- TOC entry 1911 (class 2604 OID 16738)
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY user_templates ALTER COLUMN id SET DEFAULT nextval('user_templates_id_seq'::regclass);


--
-- TOC entry 1912 (class 2604 OID 16739)
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY users ALTER COLUMN id SET DEFAULT nextval('users_id_seq'::regclass);


--
-- TOC entry 2033 (class 0 OID 16689)
-- Dependencies: 170
-- Data for Name: images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY images (id, name, img_svg, img_png, actual_size) FROM stdin;
10	Erde	<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n<!-- Created with Inkscape (http://www.inkscape.org/) -->\n\n<svg\n   xmlns:dc="http://purl.org/dc/elements/1.1/"\n   xmlns:cc="http://creativecommons.org/ns#"\n   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"\n   xmlns:svg="http://www.w3.org/2000/svg"\n   xmlns="http://www.w3.org/2000/svg"\n   xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"\n   xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"\n   width="210mm"\n   height="297mm"\n   id="svg2"\n   version="1.1"\n   inkscape:version="0.48.4 r9939"\n   sodipodi:docname="Neues Dokument 1">\n  <defs\n     id="defs4" />\n  <sodipodi:namedview\n     id="base"\n     pagecolor="#ffffff"\n     bordercolor="#666666"\n     borderopacity="1.0"\n     inkscape:pageopacity="0.0"\n     inkscape:pageshadow="2"\n     inkscape:zoom="0.35"\n     inkscape:cx="350"\n     inkscape:cy="520"\n     inkscape:document-units="px"\n     inkscape:current-layer="layer1"\n     showgrid="false"\n     inkscape:window-width="1855"\n     inkscape:window-height="1056"\n     inkscape:window-x="65"\n     inkscape:window-y="24"\n     inkscape:window-maximized="1" />\n  <metadata\n     id="metadata7">\n    <rdf:RDF>\n      <cc:Work\n         rdf:about="">\n        <dc:format>image/svg+xml</dc:format>\n        <dc:type\n           rdf:resource="http://purl.org/dc/dcmitype/StillImage" />\n        <dc:title></dc:title>\n      </cc:Work>\n    </rdf:RDF>\n  </metadata>\n  <g\n     inkscape:label="Ebene 1"\n     inkscape:groupmode="layer"\n     id="layer1">\n    <g\n       id="layer1-7"\n       inkscape:label="Ebene 1"\n       transform="translate(7.1e-6,1.1428471)"\n       style="fill:#784421">\n      <rect\n         rx="0"\n         y="-0.71208668"\n         x="-3.3599832"\n         height="1054.1486"\n         width="751.29138"\n         id="rect2985"\n         style="fill:#784421;fill-rule:evenodd;stroke:none" />\n    </g>\n  </g>\n</svg>	\N	\N
8	Asphalt	<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n<!-- Created with Inkscape (http://www.inkscape.org/) -->\n\n<svg\n   xmlns:dc="http://purl.org/dc/elements/1.1/"\n   xmlns:cc="http://creativecommons.org/ns#"\n   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"\n   xmlns:svg="http://www.w3.org/2000/svg"\n   xmlns="http://www.w3.org/2000/svg"\n   xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"\n   xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"\n   width="210mm"\n   height="297mm"\n   id="svg2"\n   version="1.1"\n   inkscape:version="0.48.4 r9939"\n   sodipodi:docname="Neues Dokument 1">\n  <defs\n     id="defs4" />\n  <sodipodi:namedview\n     id="base"\n     pagecolor="#ffffff"\n     bordercolor="#666666"\n     borderopacity="1.0"\n     inkscape:pageopacity="0.0"\n     inkscape:pageshadow="2"\n     inkscape:zoom="0.7"\n     inkscape:cx="462.58256"\n     inkscape:cy="572.01783"\n     inkscape:document-units="px"\n     inkscape:current-layer="layer1"\n     showgrid="false"\n     inkscape:window-width="1855"\n     inkscape:window-height="1056"\n     inkscape:window-x="65"\n     inkscape:window-y="24"\n     inkscape:window-maximized="1" />\n  <metadata\n     id="metadata7">\n    <rdf:RDF>\n      <cc:Work\n         rdf:about="">\n        <dc:format>image/svg+xml</dc:format>\n        <dc:type\n           rdf:resource="http://purl.org/dc/dcmitype/StillImage" />\n        <dc:title></dc:title>\n      </cc:Work>\n    </rdf:RDF>\n  </metadata>\n  <g\n     inkscape:label="Ebene 1"\n     inkscape:groupmode="layer"\n     id="layer1">\n    <rect\n       style="fill:#4d4d4d;fill-rule:evenodd;stroke:#000000;stroke-width:1.13717592px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"\n       id="rect2985"\n       width="745.57709"\n       height="1051.2914"\n       x="-1.931412"\n       y="1.5736277"\n       rx="0" />\n  </g>\n</svg>	\N	\N
9	Beton	<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n<!-- Created with Inkscape (http://www.inkscape.org/) -->\n\n<svg\n   xmlns:dc="http://purl.org/dc/elements/1.1/"\n   xmlns:cc="http://creativecommons.org/ns#"\n   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"\n   xmlns:svg="http://www.w3.org/2000/svg"\n   xmlns="http://www.w3.org/2000/svg"\n   xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"\n   xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"\n   width="210mm"\n   height="297mm"\n   id="svg2"\n   version="1.1"\n   inkscape:version="0.48.4 r9939"\n   sodipodi:docname="Erde.svg">\n  <defs\n     id="defs4" />\n  <sodipodi:namedview\n     id="base"\n     pagecolor="#ffffff"\n     bordercolor="#666666"\n     borderopacity="1.0"\n     inkscape:pageopacity="0.0"\n     inkscape:pageshadow="2"\n     inkscape:zoom="0.35"\n     inkscape:cx="350"\n     inkscape:cy="520"\n     inkscape:document-units="px"\n     inkscape:current-layer="layer1"\n     showgrid="false"\n     inkscape:window-width="1855"\n     inkscape:window-height="1056"\n     inkscape:window-x="65"\n     inkscape:window-y="24"\n     inkscape:window-maximized="1" />\n  <metadata\n     id="metadata7">\n    <rdf:RDF>\n      <cc:Work\n         rdf:about="">\n        <dc:format>image/svg+xml</dc:format>\n        <dc:type\n           rdf:resource="http://purl.org/dc/dcmitype/StillImage" />\n        <dc:title></dc:title>\n      </cc:Work>\n    </rdf:RDF>\n  </metadata>\n  <g\n     inkscape:label="Ebene 1"\n     inkscape:groupmode="layer"\n     id="layer1">\n    <g\n       id="layer1-7"\n       inkscape:label="Ebene 1"\n       transform="translate(7.1e-6,1.1428471)"\n       style="fill:#cccccc">\n      <rect\n         rx="0"\n         y="-0.71208668"\n         x="-3.3599832"\n         height="1054.1486"\n         width="751.29138"\n         id="rect2985"\n         style="fill:#cccccc;fill-rule:evenodd;stroke:none" />\n    </g>\n  </g>\n</svg>	\N	\N
2	Block links	<svg\n   xmlns:dc="http://purl.org/dc/elements/1.1/"\n   xmlns:cc="http://creativecommons.org/ns#"\n   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"\n   xmlns:svg="http://www.w3.org/2000/svg"\n   xmlns="http://www.w3.org/2000/svg"\n   xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"\n   xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"\n   width="539.14288"\n   height="1048.2856"\n   id="svg2"\n   version="1.1"\n   inkscape:version="0.48.4 r9939"\n   sodipodi:docname="block links.svg">\n  <defs\n     id="defs4" />\n  <sodipodi:namedview\n     id="base"\n     pagecolor="#ffffff"\n     bordercolor="#666666"\n     borderopacity="1.0"\n     inkscape:pageopacity="0.0"\n     inkscape:pageshadow="2"\n     inkscape:zoom="0.49497475"\n     inkscape:cx="-338.65499"\n     inkscape:cy="363.55137"\n     inkscape:document-units="px"\n     inkscape:current-layer="layer1"\n     showgrid="false"\n     inkscape:window-width="1855"\n     inkscape:window-height="1056"\n     inkscape:window-x="65"\n     inkscape:window-y="24"\n     inkscape:window-maximized="1"\n     fit-margin-top="0"\n     fit-margin-left="0"\n     fit-margin-right="0"\n     fit-margin-bottom="0" />\n  <metadata\n     id="metadata7">\n    <rdf:RDF>\n      <cc:Work\n         rdf:about="">\n        <dc:format>image/svg+xml</dc:format>\n        <dc:type\n           rdf:resource="http://purl.org/dc/dcmitype/StillImage" />\n        <dc:title></dc:title>\n      </cc:Work>\n    </rdf:RDF>\n  </metadata>\n  <g\n     inkscape:label="Ebene 1"\n     inkscape:groupmode="layer"\n     id="layer1"\n     transform="translate(-92.285736,-6.6478896)">\n    <rect\n       style="fill:#999999;stroke:none"\n       id="rect3984"\n       width="34.285717"\n       height="1018.5714"\n       x="560.85712"\n       y="35.505039" />\n    <rect\n       style="fill:#666666;stroke:none"\n       id="rect3984-3"\n       width="70.000008"\n       height="19.999996"\n       x="561.42859"\n       y="1036.505" />\n    <rect\n       style="fill:#c8beb7;stroke:none"\n       id="rect3858"\n       width="468.99847"\n       height="1042.8571"\n       x="94.715721"\n       y="6.6478896" />\n    <rect\n       style="opacity:0.98999999;fill:#6c5d53;fill-opacity:1;stroke:none"\n       id="rect4436-6-9-9"\n       width="382.85715"\n       height="5.7142859"\n       x="135.15164"\n       y="712.5636" />\n    <rect\n       style="opacity:0.98999999;fill:#6c5d53;fill-opacity:1;stroke:none"\n       id="rect4436-6-9"\n       width="382.85715"\n       height="5.7142859"\n       x="133.71431"\n       y="496.07639" />\n    <rect\n       style="opacity:0.98999999;fill:#6c5d53;fill-opacity:1;stroke:none"\n       id="rect4436-6"\n       width="382.85715"\n       height="5.7142859"\n       x="135.14287"\n       y="288.36212" />\n    <rect\n       style="opacity:0.98999999;fill:#6c5d53;fill-opacity:1;stroke:none"\n       id="rect4436"\n       width="382.85715"\n       height="5.7142859"\n       x="131.71431"\n       y="103.50496" />\n    <rect\n       style="fill:#ac9d93;stroke:none"\n       id="rect3860-5"\n       width="44.955799"\n       height="1000"\n       x="91.986778"\n       y="47.362186" />\n    <rect\n       style="fill:#ac9d93;stroke:none"\n       id="rect3860-5-8"\n       width="44.955799"\n       height="1000"\n       x="516.93591"\n       y="48.076473" />\n    <rect\n       style="fill:#ac9d93;stroke:none"\n       id="rect3860-5-7"\n       width="76.546379"\n       height="1000"\n       x="290.94186"\n       y="49.505039" />\n    <rect\n       style="fill:#6c5d53;stroke:none"\n       id="rect4006-6-9"\n       width="4.2857141"\n       height="787.14282"\n       x="515.42859"\n       y="102.07637" />\n    <rect\n       style="fill:#6c5d53;stroke:none"\n       id="rect4006-6-9-4"\n       width="4.2857141"\n       height="787.14282"\n       x="287"\n       y="102.79068" />\n    <rect\n       style="fill:#ac9d93;stroke:none"\n       id="rect3860-1"\n       width="466.56845"\n       height="41.42857"\n       x="94.715782"\n       y="248.79076" />\n    <rect\n       style="opacity:0.98999999000000005;fill:#666666;fill-opacity:1;stroke:none"\n       id="rect4456"\n       width="4.2857146"\n       height="1021.4286"\n       x="562.28571"\n       y="36.362106" />\n    <rect\n       style="fill:#ac9d93;stroke:none"\n       id="rect3860-9"\n       width="468.99847"\n       height="41.42857"\n       x="93.986778"\n       y="454.71933" />\n    <rect\n       style="fill:#ac9d93;stroke:none"\n       id="rect3860-4"\n       width="468.99847"\n       height="41.42857"\n       x="94.715721"\n       y="672.43359" />\n    <rect\n       style="fill:#ac9d93;stroke:none"\n       id="rect3860-4-8"\n       width="468.99847"\n       height="41.42857"\n       x="92.285728"\n       y="887.36218" />\n    <rect\n       style="fill:#ac9d93;stroke:none"\n       id="rect3860-1-5"\n       width="466.56845"\n       height="68.571426"\n       x="93.858665"\n       y="35.647816" />\n    <path\n       style="fill:#917c6f;fill-opacity:1;stroke:none"\n       d="m 93.714308,18.07639 c 28.878152,92.99688 10.181222,511.33182 17.592442,606.79335 -1.07201,81.37697 -5.21021,201.24129 14.17345,281.02589 39.08449,17.79197 112.88656,41.58429 136.07708,47.30848 14.61296,-0.90288 -3.57826,5.56354 -31.97156,3.68813 -32.59967,7.42171 -95.27531,36.67976 -121.90619,11.7207 C 83.560335,936.30208 95.289608,834.99849 93.755763,798.48802 90.576564,711.64658 92.4187,624.71136 91.331315,537.83195 91.139694,471.24685 93.88316,84.66155 93.714308,18.07639 z"\n       id="path3843"\n       inkscape:connector-curvature="0"\n       sodipodi:nodetypes="ccccccccc" />\n    <rect\n       style="fill:#6c5d53;stroke:none"\n       id="rect3964"\n       width="469.8038"\n       height="125.71429"\n       x="93.480392"\n       y="929.2193" />\n    <rect\n       style="fill:#4d4d4d;stroke:none"\n       id="rect3986"\n       width="21.42857"\n       height="7.1428571"\n       x="593.42859"\n       y="929.50507" />\n    <rect\n       style="fill:#6c5d53;stroke:none"\n       id="rect4006"\n       width="20"\n       height="68.571426"\n       x="594.85718"\n       y="181.6478" />\n    <rect\n       style="fill:#6c5d53;stroke:none"\n       id="rect4006-6"\n       width="20"\n       height="68.571426"\n       x="595.14288"\n       y="384.50491" />\n    <rect\n       style="fill:#6c5d53;stroke:none"\n       id="rect4006-6-4"\n       width="20"\n       height="68.571426"\n       x="595.14288"\n       y="604.50494" />\n    <rect\n       style="fill:#6c5d53;stroke:none"\n       id="rect4006-6-3"\n       width="20"\n       height="68.571426"\n       x="595.14288"\n       y="821.64777" />\n    <rect\n       style="fill:#917c6f;stroke:none"\n       id="rect3860"\n       width="468.99847"\n       height="31.428568"\n       x="93.500694"\n       y="8.0764685" />\n    <rect\n       style="opacity:0.98999999;fill:#6c5d53;fill-opacity:1;stroke:none"\n       id="rect4436-5"\n       width="464.28571"\n       height="2.8571429"\n       x="96.571472"\n       y="37.79068" />\n  </g>\n</svg>	\N	800
3	Block rechts	<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n<!-- Created with Inkscape (http://www.inkscape.org/) -->\n\n<svg\n   xmlns:dc="http://purl.org/dc/elements/1.1/"\n   xmlns:cc="http://creativecommons.org/ns#"\n   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"\n   xmlns:svg="http://www.w3.org/2000/svg"\n   xmlns="http://www.w3.org/2000/svg"\n   xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"\n   xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"\n   width="539.14288"\n   height="1048.2856"\n   id="svg2"\n   version="1.1"\n   inkscape:version="0.48.4 r9939"\n   sodipodi:docname="block rechts.svg">\n  <defs\n     id="defs4" />\n  <sodipodi:namedview\n     id="base"\n     pagecolor="#ffffff"\n     bordercolor="#666666"\n     borderopacity="1.0"\n     inkscape:pageopacity="0.0"\n     inkscape:pageshadow="2"\n     inkscape:zoom="0.49497475"\n     inkscape:cx="-338.65499"\n     inkscape:cy="363.55137"\n     inkscape:document-units="px"\n     inkscape:current-layer="layer1"\n     showgrid="false"\n     inkscape:window-width="1855"\n     inkscape:window-height="1056"\n     inkscape:window-x="65"\n     inkscape:window-y="24"\n     inkscape:window-maximized="1"\n     fit-margin-top="0"\n     fit-margin-left="0"\n     fit-margin-right="0"\n     fit-margin-bottom="0" />\n  <metadata\n     id="metadata7">\n    <rdf:RDF>\n      <cc:Work\n         rdf:about="">\n        <dc:format>image/svg+xml</dc:format>\n        <dc:type\n           rdf:resource="http://purl.org/dc/dcmitype/StillImage" />\n        <dc:title></dc:title>\n      </cc:Work>\n    </rdf:RDF>\n  </metadata>\n  <g\n     inkscape:label="Ebene 1"\n     inkscape:groupmode="layer"\n     id="layer1"\n     transform="translate(-92.285736,-6.6478896)">\n    <rect\n       style="fill:#999999;stroke:none"\n       id="rect3984"\n       width="34.285717"\n       height="1018.5714"\n       x="-163.8932"\n       y="35.505039"\n       transform="scale(-1,1)" />\n    <rect\n       style="fill:#666666;stroke:none"\n       id="rect3984-3"\n       width="70.000008"\n       height="19.999996"\n       x="-163.32173"\n       y="1036.505"\n       transform="scale(-1,1)" />\n    <rect\n       style="fill:#c8beb7;stroke:none"\n       id="rect3858"\n       width="468.99847"\n       height="1042.8571"\n       x="-630.03461"\n       y="6.6478896"\n       transform="scale(-1,1)" />\n    <rect\n       style="opacity:0.98999999;fill:#6c5d53;fill-opacity:1;stroke:none"\n       id="rect4436-6-9-9"\n       width="382.85715"\n       height="5.7142859"\n       x="-589.59869"\n       y="712.5636"\n       transform="scale(-1,1)" />\n    <rect\n       style="opacity:0.98999999;fill:#6c5d53;fill-opacity:1;stroke:none"\n       id="rect4436-6-9"\n       width="382.85715"\n       height="5.7142859"\n       x="-591.03601"\n       y="496.07639"\n       transform="scale(-1,1)" />\n    <rect\n       style="opacity:0.98999999;fill:#6c5d53;fill-opacity:1;stroke:none"\n       id="rect4436-6"\n       width="382.85715"\n       height="5.7142859"\n       x="-589.60742"\n       y="288.36212"\n       transform="scale(-1,1)" />\n    <rect\n       style="opacity:0.98999999;fill:#6c5d53;fill-opacity:1;stroke:none"\n       id="rect4436"\n       width="382.85715"\n       height="5.7142859"\n       x="-593.03601"\n       y="103.50496"\n       transform="scale(-1,1)" />\n    <rect\n       style="fill:#ac9d93;stroke:none"\n       id="rect3860-5"\n       width="44.955799"\n       height="1000"\n       x="-632.76355"\n       y="47.362186"\n       transform="scale(-1,1)" />\n    <rect\n       style="fill:#ac9d93;stroke:none"\n       id="rect3860-5-8"\n       width="44.955799"\n       height="1000"\n       x="-207.81441"\n       y="48.076473"\n       transform="scale(-1,1)" />\n    <rect\n       style="fill:#ac9d93;stroke:none"\n       id="rect3860-5-7"\n       width="76.546379"\n       height="1000"\n       x="-433.80844"\n       y="49.505039"\n       transform="scale(-1,1)" />\n    <rect\n       style="fill:#6c5d53;stroke:none"\n       id="rect4006-6-9"\n       width="4.2857141"\n       height="787.14282"\n       x="-359.32172"\n       y="102.07637"\n       transform="scale(-1,1)" />\n    <rect\n       style="fill:#6c5d53;stroke:none"\n       id="rect4006-6-9-4"\n       width="4.2857141"\n       height="787.14282"\n       x="-587.75031"\n       y="102.79068"\n       transform="scale(-1,1)" />\n    <rect\n       style="fill:#ac9d93;stroke:none"\n       id="rect3860-1"\n       width="466.56845"\n       height="41.42857"\n       x="-630.03455"\n       y="248.79076"\n       transform="scale(-1,1)" />\n    <rect\n       style="opacity:0.98999999;fill:#666666;fill-opacity:1;stroke:none"\n       id="rect4456"\n       width="4.2857146"\n       height="1021.4286"\n       x="-162.46461"\n       y="36.362106"\n       transform="scale(-1,1)" />\n    <rect\n       style="fill:#ac9d93;stroke:none"\n       id="rect3860-9"\n       width="468.99847"\n       height="41.42857"\n       x="-630.76355"\n       y="454.71933"\n       transform="scale(-1,1)" />\n    <rect\n       style="fill:#ac9d93;stroke:none"\n       id="rect3860-4"\n       width="468.99847"\n       height="41.42857"\n       x="-630.03461"\n       y="672.43359"\n       transform="scale(-1,1)" />\n    <rect\n       style="fill:#ac9d93;stroke:none"\n       id="rect3860-4-8"\n       width="468.99847"\n       height="41.42857"\n       x="-632.4646"\n       y="887.36218"\n       transform="scale(-1,1)" />\n    <rect\n       style="fill:#ac9d93;stroke:none"\n       id="rect3860-1-5"\n       width="466.56845"\n       height="68.571426"\n       x="-630.89166"\n       y="35.647816"\n       transform="scale(-1,1)" />\n    <path\n       style="fill:#917c6f;fill-opacity:1;stroke:none"\n       d="m 631.03601,18.07639 c -28.87816,92.99688 -10.18123,511.33182 -17.59245,606.79335 1.07201,81.37697 5.21021,201.24129 -14.17345,281.02589 -39.08449,17.79197 -112.88656,41.58429 -136.07708,47.30848 -14.61296,-0.90288 3.57826,5.56354 31.97156,3.68813 32.59967,7.42171 95.27531,36.67976 121.90619,11.7207 24.1192,-32.31086 12.38993,-133.61445 13.92377,-170.12492 3.1792,-86.84144 1.33706,-173.77666 2.42445,-260.65607 0.19162,-66.5851 -2.55185,-453.1704 -2.38299,-519.75556 z"\n       id="path3843"\n       inkscape:connector-curvature="0"\n       sodipodi:nodetypes="ccccccccc" />\n    <rect\n       style="fill:#6c5d53;stroke:none"\n       id="rect3964"\n       width="469.8038"\n       height="125.71429"\n       x="-631.2699"\n       y="929.2193"\n       transform="scale(-1,1)" />\n    <rect\n       style="fill:#4d4d4d;stroke:none"\n       id="rect3986"\n       width="21.42857"\n       height="7.1428571"\n       x="-131.32173"\n       y="929.50507"\n       transform="scale(-1,1)" />\n    <rect\n       style="fill:#6c5d53;stroke:none"\n       id="rect4006"\n       width="20"\n       height="68.571426"\n       x="-129.89314"\n       y="181.6478"\n       transform="scale(-1,1)" />\n    <rect\n       style="fill:#6c5d53;stroke:none"\n       id="rect4006-6"\n       width="20"\n       height="68.571426"\n       x="-129.60742"\n       y="384.50491"\n       transform="scale(-1,1)" />\n    <rect\n       style="fill:#6c5d53;stroke:none"\n       id="rect4006-6-4"\n       width="20"\n       height="68.571426"\n       x="-129.60742"\n       y="604.50494"\n       transform="scale(-1,1)" />\n    <rect\n       style="fill:#6c5d53;stroke:none"\n       id="rect4006-6-3"\n       width="20"\n       height="68.571426"\n       x="-129.60742"\n       y="821.64777"\n       transform="scale(-1,1)" />\n    <rect\n       style="fill:#917c6f;stroke:none"\n       id="rect3860"\n       width="468.99847"\n       height="31.428568"\n       x="-631.24963"\n       y="8.0764685"\n       transform="scale(-1,1)" />\n    <rect\n       style="opacity:0.98999999;fill:#6c5d53;fill-opacity:1;stroke:none"\n       id="rect4436-5"\n       width="464.28571"\n       height="2.8571429"\n       x="-628.17883"\n       y="37.79068"\n       transform="scale(-1,1)" />\n  </g>\n</svg>	\N	800
4	Baum grosse Krone	<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n<!-- Created with Inkscape (http://www.inkscape.org/) -->\n\n<svg\n   xmlns:dc="http://purl.org/dc/elements/1.1/"\n   xmlns:cc="http://creativecommons.org/ns#"\n   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"\n   xmlns:svg="http://www.w3.org/2000/svg"\n   xmlns="http://www.w3.org/2000/svg"\n   xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"\n   xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"\n   width="1132.1801"\n   height="1279.2771"\n   id="svg2"\n   version="1.1"\n   inkscape:version="0.48.4 r9939"\n   sodipodi:docname="Baum.svg">\n  <defs\n     id="defs4" />\n  <sodipodi:namedview\n     id="base"\n     pagecolor="#ffffff"\n     bordercolor="#666666"\n     borderopacity="1.0"\n     inkscape:pageopacity="0.0"\n     inkscape:pageshadow="2"\n     inkscape:zoom="0.35"\n     inkscape:cx="-90.181233"\n     inkscape:cy="100.10133"\n     inkscape:document-units="px"\n     inkscape:current-layer="layer1"\n     showgrid="false"\n     inkscape:window-width="1855"\n     inkscape:window-height="1056"\n     inkscape:window-x="65"\n     inkscape:window-y="24"\n     inkscape:window-maximized="1"\n     fit-margin-top="0"\n     fit-margin-left="0"\n     fit-margin-right="0"\n     fit-margin-bottom="0" />\n  <metadata\n     id="metadata7">\n    <rdf:RDF>\n      <cc:Work\n         rdf:about="">\n        <dc:format>image/svg+xml</dc:format>\n        <dc:type\n           rdf:resource="http://purl.org/dc/dcmitype/StillImage" />\n        <dc:title></dc:title>\n      </cc:Work>\n    </rdf:RDF>\n  </metadata>\n  <g\n     inkscape:label="Ebene 1"\n     inkscape:groupmode="layer"\n     id="layer1"\n     transform="translate(-77.908396,226.91489)">\n    <path\n       style="opacity:0.98999999;fill:#006400;fill-opacity:1;stroke:none"\n       d="m 988.68764,-131.82191 c 41.42786,14.62699 85.54196,24.14606 125.17776,44.264613 28.2889,18.21549 42.0942,56.3922 37.8106,90.7772099 20.5196,25.2265001 49.1548,52.5502501 45.583,91.8568901 0,35.364157 0,70.728317 0,106.092477 29.5773,23.14402 -46.6743,50.4811 -42.9715,92.29388 3.1826,34.67706 12.2148,81.06531 -24.8172,99.0555 -23.6399,29.23038 -39.8959,62.69108 -74.1329,80.04878 -36.8665,22.7272 20.4959,0.4468 -55.2213,18.2301 -32.31966,33.5446 -32.12716,5.9275 -56.93876,24.2007 -32.482,36.8333 -100.1843,22.7476 -138.6714,32.8628 -41.9416,6.3439 -40.7544,-21.8605 -85.2336,-30.2893 -39.9444,-14.1454 -88.3578,38.4751 -128.456,27.6781 -42.2032,-4.258 -44.0794,-57.3536 -76.862,-73.8086 -26.7344,-18.7917 -21.1552,-71.81586 -64.6436,-52.633 -38.8272,-11.8314 -35.8647,-69.10729 -33.8616,-103.27319 -29.9294,-39.9137 31.7377,-69.74047 8.4435,-105.98374 -1.0594,-45.37896 -54.2392,-52.10129 -62.2878,-94.82537 -7.2267,-40.637037 9.9971,-81.420077 25.9649,-117.1433171 34.0009,-33.2001399 27.509,-90.3934499 58.1202,-124.8993929 39.5828,-21.84846 91.9692,0.19516 120.832,-44.96164 31.1428,-24.76166 69.7211,-42.73972 109.1725,-38.97259 32.0559,-7.66826 50.4743,27.23283 78.915,36.48382 46.0352,25.64841 65.6055,-40.1681 104.9199,-50.56273 40.6781,-7.86259 84.8386,14.15682 106.3225,52.08918 10.8273,11.9861 20.6764,23.83933 22.8358,41.41882 z"\n       id="path3933-4"\n       inkscape:connector-curvature="0"\n       sodipodi:nodetypes="cccccccccccccccccccccccccc" />\n    <path\n       style="fill:#552200;fill-opacity:1;stroke:none"\n       d="m 531.91927,1060.4841 c 56.5116,-112.58969 138.5995,-217.36154 149.9909,-347.6754 12.6387,-76.9736 20.7459,-154.89478 40.0155,-230.5975 59.5032,-23.24807 111.1342,17.62524 86.89,88.33659 -17.0959,98.70426 -12.9623,192.75837 -27.8931,292.09877 -20.179,69.38495 -4.3077,122.60955 -22.2866,192.60514 -58.8375,14.4013 -166.5786,-9.1594 -226.7167,5.2324 z"\n       id="path3878-5"\n       inkscape:connector-curvature="0"\n       sodipodi:nodetypes="ccccccc" />\n    <path\n       style="fill:#803300;fill-opacity:1;stroke:none"\n       d="m 507.71428,1060.9336 c 56.51165,-112.57589 115.74232,-217.335 127.13379,-347.63294 12.63872,-76.96421 20.74589,-154.87588 40.01547,-230.56935 59.5032,-23.24524 133.99134,-14.26908 109.7471,56.43363 -17.09584,98.69222 -35.81943,221.72772 -50.75015,321.05597 -20.17907,69.37649 -52.8792,122.5946 -70.85811,192.58169 -58.83745,14.3995 -95.15003,-6.2591 -155.2881,8.131 z"\n       id="path3878"\n       inkscape:connector-curvature="0"\n       sodipodi:nodetypes="ccccccc" />\n    <path\n       style="fill:#552200;fill-opacity:1;stroke:none"\n       d="m 677.71429,586.64789 c -9.90066,0.65618 -4.67057,-17.35027 -1.30132,-3.26562 -24.7111,-20.78462 -54.60924,-36.44786 -71.62354,-65.09412 -17.51758,-18.74887 -10.58048,-47.28616 -25.38572,-66.48833 -6.078,-8.86742 -45.89384,-11.43683 -23.30642,-1.16895 5.31835,23.56165 20.73206,42.67452 27.1637,67.54376 -4.68807,28.6491 22.15587,42.33994 49.04253,52.072 21.44421,6.25382 40.61011,55.80552 47.42042,21.10608 z"\n       id="path3907"\n       inkscape:connector-curvature="0"\n       sodipodi:nodetypes="ccccccccc" />\n    <path\n       style="fill:#6f3000;fill-opacity:1;stroke:none"\n       d="m 686.6679,578.09256 c -9.90066,0.65618 -4.67057,-17.35027 -1.30132,-3.26562 -24.7111,-20.78462 -54.60924,-36.44786 -71.62354,-65.09412 -17.51758,-18.74887 -10.58048,-47.28616 -25.38572,-66.48833 -6.078,-8.86742 -55.89384,-10.00826 -33.30642,0.25962 5.31835,23.56165 25.01777,41.24595 37.1637,66.11519 -4.68807,28.6491 22.15587,42.33994 49.04253,52.072 21.44421,6.25382 40.61011,55.80552 47.42042,21.10608 z"\n       id="path3907-4"\n       inkscape:connector-curvature="0"\n       sodipodi:nodetypes="ccccccccc" />\n    <path\n       style="opacity:0.98999999;fill:#007a00;fill-opacity:1;stroke:none"\n       d="m 990.4362,-124.33728 c 41.428,14.627 19.8277,29.860356 59.4635,49.978906 28.2889,18.21549 64.9514,10.677905 60.6678,45.062915 20.5196,25.2265055 60.5834,35.4073999 57.0116,74.714034 0,35.364162 -11.4286,87.871185 -11.4286,123.235345 29.5773,23.14402 -58.1029,90.4811 -54.4,132.29388 3.1825,34.67706 -4.9282,15.35102 -41.9601,33.34121 -23.64,29.23034 -59.89598,5.54826 -94.13298,22.90591 -36.86646,22.72723 54.78168,57.58965 -20.9355,75.37294 -32.31974,33.54458 -46.413,20.21323 -71.22457,38.48648 -32.48195,36.83322 -71.61286,34.17616 -110.10001,44.29136 -41.94155,6.34386 -40.75438,-21.8605 -85.23358,-30.28929 -39.94442,-14.14545 -62.64352,7.04647 -102.74164,-3.75054 -42.20328,-4.25794 4.49194,-34.49639 -28.2906,-50.95146 -26.7344,-18.79169 18.84477,-80.38724 -24.64357,-61.20438 -38.82725,-11.83142 -75.8647,-31.96444 -73.86166,-66.13034 -29.92939,-39.9137 26.02341,-49.74047 2.72921,-85.98374 -1.05943,-45.37896 5.76084,-40.67272 -2.2878,-83.3968 C 441.84098,93.002103 416.20771,43.64764 432.17552,7.9243999 466.17638,-25.275737 471.11309,-85.32619 501.72429,-119.83214 c 39.58274,-21.84846 100.54056,17.33802 129.4034,-27.81878 31.14281,-24.76166 26.86395,-39.88258 66.31533,-36.11545 32.05595,-7.66826 -12.38284,-32.76717 16.05785,-23.51618 46.03522,25.64841 77.03407,51.26047 116.34844,40.86584 40.67819,-7.86259 73.41004,-77.27175 94.89393,-39.33939 10.82735,11.9861 63.53363,63.83933 65.69296,81.41882 z"\n       id="path3933"\n       inkscape:connector-curvature="0"\n       sodipodi:nodetypes="cccccccccccccccccccccccccc" />\n  </g>\n</svg>	\N	600
5	schmaler Baum	<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n<!-- Created with Inkscape (http://www.inkscape.org/) -->\n\n<svg\n   xmlns:dc="http://purl.org/dc/elements/1.1/"\n   xmlns:cc="http://creativecommons.org/ns#"\n   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"\n   xmlns:svg="http://www.w3.org/2000/svg"\n   xmlns="http://www.w3.org/2000/svg"\n   xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"\n   xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"\n   width="404.47"\n   height="1082.4198"\n   id="svg2"\n   version="1.1"\n   inkscape:version="0.48.4 r9939"\n   sodipodi:docname="Baum2.svg">\n  <defs\n     id="defs4" />\n  <sodipodi:namedview\n     id="base"\n     pagecolor="#ffffff"\n     bordercolor="#666666"\n     borderopacity="1.0"\n     inkscape:pageopacity="0.0"\n     inkscape:pageshadow="2"\n     inkscape:zoom="0.35"\n     inkscape:cx="-560.75266"\n     inkscape:cy="114.38692"\n     inkscape:document-units="px"\n     inkscape:current-layer="layer1"\n     showgrid="false"\n     inkscape:window-width="1855"\n     inkscape:window-height="1056"\n     inkscape:window-x="65"\n     inkscape:window-y="24"\n     inkscape:window-maximized="1"\n     fit-margin-top="0"\n     fit-margin-left="0"\n     fit-margin-right="0"\n     fit-margin-bottom="0" />\n  <metadata\n     id="metadata7">\n    <rdf:RDF>\n      <cc:Work\n         rdf:about="">\n        <dc:format>image/svg+xml</dc:format>\n        <dc:type\n           rdf:resource="http://purl.org/dc/dcmitype/StillImage" />\n        <dc:title></dc:title>\n      </cc:Work>\n    </rdf:RDF>\n  </metadata>\n  <g\n     inkscape:label="Ebene 1"\n     inkscape:groupmode="layer"\n     id="layer1"\n     transform="translate(-548.47982,15.772037)">\n    <path\n       style="opacity:0.98999999;fill:#446b00;fill-opacity:1;stroke:none"\n       d="m 862.58413,93.874304 c 16.61019,15.327376 34.29741,25.302256 50.18909,46.384146 11.34222,19.0877 16.87735,59.09244 15.15986,95.1239 8.22719,26.43444 19.70825,55.06654 18.27618,96.25531 0,37.05749 0,74.11501 0,111.17251 11.85879,24.25223 -18.71372,52.8983 -17.2291,96.71321 1.27604,36.3375 4.89742,84.94697 -9.95028,103.7986 -9.47824,30.63002 -13.08975,27.47537 -26.81681,45.66422 -14.78133,23.81545 5.31148,38.68574 -25.04678,57.32056 -12.95831,35.15083 -12.88114,6.21134 -22.82919,25.35951 -13.02339,38.597 -40.16812,23.83683 -55.59923,34.43638 -16.81616,6.64766 -16.34017,-22.90726 -34.17377,-31.73965 -16.01541,-14.82273 -35.4264,40.3174 -51.50346,29.00341 -16.92105,-4.46188 -17.6733,-60.09987 -30.81725,-77.3428 -10.71896,-19.6915 -8.48202,-75.25463 -25.91836,-55.15323 -15.56748,-12.39792 -14.37969,-72.41636 -13.57656,-108.21823 -11.99996,-41.82491 9.81878,-73.07988 0.47915,-111.05859 -0.42474,-47.55185 -18.84058,-54.59606 -22.06762,-99.36591 -2.89749,-42.58286 4.00826,-85.31873 10.41043,-122.75251 13.63242,-34.78987 11.02955,-94.72178 23.30287,-130.879975 15.87042,-22.894634 36.87435,0.204504 48.44667,-47.114554 12.48648,-25.94732 27.95415,-44.7862281 43.7719,-40.838718 12.85257,-8.0354401 31.86211,-21.43996 43.2652,-11.746 18.45746,26.876537 14.6792,7.8853099 30.44203,-3.00705 16.30955,-8.23908 34.01538,14.83469 42.6292,54.583367 4.34112,12.560043 8.29004,24.980842 9.15583,43.402094 z"\n       id="path3933-4"\n       inkscape:connector-curvature="0"\n       sodipodi:nodetypes="cccccccccccccccccccccccccc" />\n    <path\n       style="fill:#6c5d53;fill-opacity:1;stroke:none"\n       d="m 710.5704,1056.1984 c 51.30835,-112.58971 42.82771,-203.07584 53.17026,-333.3897 11.475,-76.9736 -9.69907,-154.89478 7.79629,-230.5975 54.0245,-23.24807 67.17866,14.7681 45.16672,85.47945 -15.52181,98.70426 -1.39251,195.61551 -14.94857,294.95591 -18.32104,69.38495 19.43559,122.60955 3.11209,192.60514 -53.42009,14.4013 -39.69585,-23.4451 -94.29679,-9.0533 z"\n       id="path3878-5"\n       inkscape:connector-curvature="0"\n       sodipodi:nodetypes="ccccccc" />\n    <path\n       style="fill:#917c6f;fill-opacity:1;stroke:none"\n       d="m 685.99999,1076.6478 c 35.74395,-112.57581 40.2336,-217.33492 50.57622,-347.63286 11.47502,-76.96421 -17.48131,-157.73302 0.0141,-233.42649 54.02449,-23.24524 93.11939,-17.12622 71.10742,53.57649 -15.52176,98.69222 -3.98658,224.58486 -17.54256,323.91311 -18.3211,69.37649 16.84145,122.5946 0.51793,192.58165 -53.42004,14.3995 -50.07214,-3.402 -104.67305,10.9881 z"\n       id="path3878"\n       inkscape:connector-curvature="0"\n       sodipodi:nodetypes="cccccccc" />\n    <path\n       style="opacity:0.98999999;fill:#668000;fill-opacity:1;stroke:none"\n       d="m 866.5368,120.3522 c 14.02162,15.05022 -2.00777,30.72433 11.40726,51.42499 9.57459,18.74253 7.45226,10.98685 6.00244,46.36675 6.94502,25.9564 20.50491,36.43186 19.296,76.87578 0,36.38739 13.56916,155.08947 13.56916,191.47684 10.01066,23.81366 -16.75916,75.4602 -15.50589,118.48278 1.07714,35.68039 -1.66798,15.79518 -14.20171,34.3059 -8.00114,30.07608 -28.99088,26.28746 -40.57865,44.14733 -12.47774,23.38481 27.2599,38.67726 1.63284,56.97509 -10.93886,34.51515 -36.05228,-26.23891 -44.44994,-7.43694 -10.99377,37.89894 -24.23793,35.165 -37.2642,45.57288 -14.19543,6.52741 -13.79363,-22.49301 -28.84795,-31.16568 -13.5195,-14.55473 -21.20218,7.25035 -34.7737,-3.85906 -14.28401,-4.38113 1.52033,-35.49449 -9.57517,-52.42567 -9.04846,-19.33541 -43.02736,-88.59277 -57.74633,-68.85487 -13.14138,-12.17375 23.72856,-27.00968 24.40649,-62.16412 -10.12983,-41.06855 8.80783,-51.17964 0.92372,-88.47157 -0.35857,-46.69194 -27.11227,-91.82631 -29.83639,-135.78656 -2.44595,-41.81283 17.94036,-42.61852 23.34477,-79.37537 11.50786,-34.16074 13.17873,-95.94867 23.53932,-131.45301 13.39708,-22.48061 34.02872,17.83968 43.79758,-28.623675 10.54051,-25.478104 9.0923,-41.036528 22.44492,-37.160407 10.84958,-7.890132 -4.19106,-33.715241 5.4349,-24.196587 15.58097,26.390514 8.63552,-17.811832 21.94177,-28.5072181 13.76783,-8.0900799 42.28344,-8.9520499 49.55482,30.0778361 3.66461,12.3329 44.7531,65.686441 45.48394,83.774561 z"\n       id="path3933"\n       inkscape:connector-curvature="0"\n       sodipodi:nodetypes="cccccccccccccccccccccccccc" />\n  </g>\n</svg>	\N	300
6	PKW von vorn	<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n<!-- Created with Inkscape (http://www.inkscape.org/) -->\n\n<svg\n   xmlns:dc="http://purl.org/dc/elements/1.1/"\n   xmlns:cc="http://creativecommons.org/ns#"\n   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"\n   xmlns:svg="http://www.w3.org/2000/svg"\n   xmlns="http://www.w3.org/2000/svg"\n   xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"\n   xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"\n   width="213.39035"\n   height="175.65695"\n   id="svg2"\n   version="1.1"\n   inkscape:version="0.48.4 r9939"\n   sodipodi:docname="Haus.svg">\n  <defs\n     id="defs4" />\n  <sodipodi:namedview\n     id="base"\n     pagecolor="#ffffff"\n     bordercolor="#666666"\n     borderopacity="1.0"\n     inkscape:pageopacity="0.0"\n     inkscape:pageshadow="2"\n     inkscape:zoom="0.35"\n     inkscape:cx="1202.9233"\n     inkscape:cy="-711.32737"\n     inkscape:document-units="px"\n     inkscape:current-layer="layer1"\n     showgrid="true"\n     inkscape:window-width="1188"\n     inkscape:window-height="844"\n     inkscape:window-x="364"\n     inkscape:window-y="87"\n     inkscape:window-maximized="0"\n     fit-margin-top="0"\n     fit-margin-left="0"\n     fit-margin-right="0"\n     fit-margin-bottom="0">\n    <inkscape:grid\n       type="xygrid"\n       id="grid3007"\n       empspacing="5"\n       visible="true"\n       enabled="true"\n       snapvisiblegridlinesonly="true"\n       originx="-5.6721973px"\n       originy="-870.91486px" />\n  </sodipodi:namedview>\n  <metadata\n     id="metadata7">\n    <rdf:RDF>\n      <cc:Work\n         rdf:about="">\n        <dc:format>image/svg+xml</dc:format>\n        <dc:type\n           rdf:resource="http://purl.org/dc/dcmitype/StillImage" />\n        <dc:title />\n      </cc:Work>\n    </rdf:RDF>\n  </metadata>\n  <g\n     inkscape:label="Ebene 1"\n     inkscape:groupmode="layer"\n     id="layer1"\n     transform="translate(-5.6721973,-5.7903626)">\n    <rect\n       style="fill:#333333;fill-opacity:1;stroke:#b0dead;stroke-width:0;stroke-linecap:butt;stroke-linejoin:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none"\n       id="rect3184-8"\n       width="34.529457"\n       height="66.920952"\n       x="184.5331"\n       y="113.06757"\n       rx="17.264729" />\n    <rect\n       style="fill:#333333;fill-opacity:1;stroke:#b0dead;stroke-width:0;stroke-linecap:butt;stroke-linejoin:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none"\n       id="rect3184"\n       width="34.529457"\n       height="66.920952"\n       x="5.6721973"\n       y="114.52637"\n       rx="17.264729" />\n    <path\n       style="fill:#cccccc;fill-opacity:1;stroke:#b0dead;stroke-width:0.36432263;stroke-linejoin:round;stroke-miterlimit:4;stroke-opacity:1"\n       d="m 62.282138,7.3245539 46.920492,-1.35203 54.8392,1.35203 c 22.321,0.5503 50.9021,68.4593401 51.0481,78.6585301 l 0.6599,46.107966 c 0.3878,27.09566 -25.9151,20.52224 -52.3679,20.52224 l -101.759692,0 c -26.4528,0 -52.0692999,6.57379 -51.7078999,-20.52224 L 10.574138,82.603074 c 0.1888,-14.15221 25.2553,-75.2785201 51.708,-75.2785201 z"\n       id="rect3069"\n       inkscape:connector-curvature="0"\n       sodipodi:nodetypes="scssssssss" />\n    <path\n       style="fill:#ffffff;fill-opacity:1;stroke:#b0dead;stroke-width:0.32973874;stroke-linejoin:round;stroke-miterlimit:4;stroke-opacity:1"\n       d="m 110.09143,12.160724 -42.251292,1.22654 c -18.9986,0 -37.2033,35.37558 -43.8797,56.22835 l 176.937992,0 c -8.2904,-21.3385 -26.4258,-55.85465 -41.4291,-56.22835 l -49.3779,-1.22654 z"\n       id="rect3069-0"\n       inkscape:connector-curvature="0" />\n    <path\n       style="fill:#4d4d4d;fill-opacity:1;stroke:#b0dead;stroke-width:0.31946275;stroke-linejoin:round;stroke-miterlimit:4;stroke-opacity:1"\n       d="m 16.588738,131.49563 c -0.2542,22.1077 23.6966,16.73538 48.4332,16.73538 l 95.323292,0 c 24.7365,0 49.3304,5.37199 49.0537,-16.73538 l -192.810192,0 z"\n       id="rect3069-9"\n       inkscape:connector-curvature="0" />\n    <path\n       transform="matrix(0.28649773,0,0,0.29349268,-47.521762,-24.510746)"\n       sodipodi:type="arc"\n       style="fill:#ffffff;fill-opacity:1;stroke:#b0dead;stroke-width:1.079;stroke-linejoin:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none"\n       id="path3156"\n       sodipodi:cx="280.13364"\n       sodipodi:cy="429.75845"\n       sodipodi:rx="58.632626"\n       sodipodi:ry="53.746574"\n       d="m 338.76626,429.75845 c 0,29.68342 -26.25072,53.74658 -58.63262,53.74658 -32.38191,0 -58.63263,-24.06316 -58.63263,-53.74658 0,-29.68341 26.25072,-53.74657 58.63263,-53.74657 32.3819,0 58.63262,24.06316 58.63262,53.74657 z" />\n    <path\n       transform="matrix(0.28649773,0,0,0.29349268,105.52773,-27.856796)"\n       sodipodi:type="arc"\n       style="fill:#ffffff;fill-opacity:1;stroke:#b0dead;stroke-width:1.079;stroke-linejoin:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none"\n       id="path3156-4"\n       sodipodi:cx="280.13364"\n       sodipodi:cy="429.75845"\n       sodipodi:rx="58.632626"\n       sodipodi:ry="53.746574"\n       d="m 338.76626,429.75845 c 0,29.68342 -26.25072,53.74658 -58.63262,53.74658 -32.38191,0 -58.63263,-24.06316 -58.63263,-53.74658 0,-29.68341 26.25072,-53.74657 58.63263,-53.74657 32.3819,0 58.63262,24.06316 58.63262,53.74657 z" />\n  </g>\n</svg>	\N	170
7	PKW von hinten	<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n<!-- Created with Inkscape (http://www.inkscape.org/) -->\n\n<svg\n   xmlns:dc="http://purl.org/dc/elements/1.1/"\n   xmlns:cc="http://creativecommons.org/ns#"\n   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"\n   xmlns:svg="http://www.w3.org/2000/svg"\n   xmlns="http://www.w3.org/2000/svg"\n   xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"\n   xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"\n   width="223.03244"\n   height="176.92419"\n   id="svg2"\n   version="1.1"\n   inkscape:version="0.48.4 r9939"\n   sodipodi:docname="auto hinten.svg">\n  <defs\n     id="defs4" />\n  <sodipodi:namedview\n     id="base"\n     pagecolor="#ffffff"\n     bordercolor="#666666"\n     borderopacity="1.0"\n     inkscape:pageopacity="0.0"\n     inkscape:pageshadow="2"\n     inkscape:zoom="1.4"\n     inkscape:cx="331.81308"\n     inkscape:cy="-26.440533"\n     inkscape:document-units="px"\n     inkscape:current-layer="layer1"\n     showgrid="true"\n     inkscape:window-width="1855"\n     inkscape:window-height="1056"\n     inkscape:window-x="65"\n     inkscape:window-y="24"\n     inkscape:window-maximized="1"\n     fit-margin-top="0"\n     fit-margin-left="0"\n     fit-margin-right="0"\n     fit-margin-bottom="0">\n    <inkscape:grid\n       type="xygrid"\n       id="grid3007"\n       empspacing="5"\n       visible="true"\n       enabled="true"\n       snapvisiblegridlinesonly="true"\n       originx="-1.3527951px"\n       originy="-874.34461px" />\n  </sodipodi:namedview>\n  <metadata\n     id="metadata7">\n    <rdf:RDF>\n      <cc:Work\n         rdf:about="">\n        <dc:format>image/svg+xml</dc:format>\n        <dc:type\n           rdf:resource="http://purl.org/dc/dcmitype/StillImage" />\n        <dc:title />\n      </cc:Work>\n    </rdf:RDF>\n  </metadata>\n  <g\n     inkscape:label="Ebene 1"\n     inkscape:groupmode="layer"\n     id="layer1"\n     transform="translate(-1.3527951,-1.0933696)">\n    <rect\n       style="fill:#333333;fill-opacity:1;stroke:#b0dead;stroke-width:0;stroke-linecap:butt;stroke-linejoin:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none"\n       id="rect3184-8-2"\n       width="36.089691"\n       height="67.402428"\n       x="188.29555"\n       y="109.14584"\n       rx="18.044846" />\n    <rect\n       style="fill:#333333;fill-opacity:1;stroke:#b0dead;stroke-width:0;stroke-linecap:butt;stroke-linejoin:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none"\n       id="rect3184-4"\n       width="36.089691"\n       height="67.402428"\n       x="1.3527951"\n       y="110.61514"\n       rx="18.044846" />\n    <path\n       style="fill:#cccccc;fill-opacity:1;stroke:#b0dead;stroke-width:0.37380025;stroke-linejoin:round;stroke-miterlimit:4;stroke-opacity:1"\n       d="m 60.5206,2.6419997 49.04066,-1.36173 57.3172,1.36173 c 23.3295,0.55427 53.2021,68.9519103 53.3547,79.2244903 l 0.6896,46.43967 c 0.4054,27.29062 -27.086,20.66993 -54.734,20.66993 l -106.35784,0 c -27.64801,0 -54.4220701,6.62109 -54.0444301,-20.66993 l 0.68975,-49.84399 C 6.6734699,64.20814 32.87259,2.6419997 60.5206,2.6419997 z"\n       id="rect3069-5"\n       inkscape:connector-curvature="0"\n       sodipodi:nodetypes="scssssssss" />\n    <path\n       style="fill:#ffffff;fill-opacity:1;stroke:#b0dead;stroke-width:0.25858414;stroke-linejoin:round;stroke-miterlimit:4;stroke-opacity:1"\n       d="m 110.89686,12.28783 -44.07015,0.72322 c -19.81648,0 -32.60779,19.89484 -39.57172,32.18964 l 165.99307,-0.48202 c -8.6472,-12.58124 -15.1986,-31.48735 -30.8477,-31.70762 z"\n       id="rect3069-0-5"\n       inkscape:connector-curvature="0"\n       sodipodi:nodetypes="cccccc" />\n    <path\n       style="fill:#4d4d4d;fill-opacity:1;stroke:#b0dead;stroke-width:0.24595271;stroke-linejoin:round;stroke-miterlimit:4;stroke-opacity:1"\n       d="m 12.7215,135.36896 c -0.26584,12.53241 24.77735,9.48694 50.64232,9.48694 l 99.67104,0 c 25.865,0 51.5806,3.04531 51.2913,-9.48694 l -201.60466,0 z"\n       id="rect3069-9-1"\n       inkscape:connector-curvature="0" />\n    <rect\n       style="fill:#800000;fill-opacity:1;stroke:#b0dead;stroke-width:0;stroke-linecap:butt;stroke-linejoin:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none"\n       id="rect4010"\n       width="20.483337"\n       height="27.923864"\n       x="14.032969"\n       y="88.468727"\n       rx="6.9400868"\n       ry="9.6289177" />\n    <rect\n       style="fill:#800000;fill-opacity:1;stroke:#b0dead;stroke-width:0;stroke-linecap:butt;stroke-linejoin:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none"\n       id="rect4010-8"\n       width="20.483337"\n       height="27.923864"\n       x="188.14137"\n       y="87.987289"\n       rx="6.9400868"\n       ry="9.6289177" />\n    <rect\n       style="fill:#666666;fill-opacity:1;stroke:#b0dead;stroke-width:0;stroke-linejoin:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none"\n       id="rect4066"\n       width="124.59389"\n       height="1.9695424"\n       x="48.963512"\n       y="58.770977"\n       rx="17.501011"\n       ry="1.9695424" />\n  </g>\n</svg>	\N	170
11	Fahrbahnmarkierung gestrichelt	<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n<!-- Created with Inkscape (http://www.inkscape.org/) -->\n\n<svg\n   xmlns:dc="http://purl.org/dc/elements/1.1/"\n   xmlns:cc="http://creativecommons.org/ns#"\n   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"\n   xmlns:svg="http://www.w3.org/2000/svg"\n   xmlns="http://www.w3.org/2000/svg"\n   xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"\n   xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"\n   width="19.075714"\n   height="932.18463"\n   id="svg2"\n   version="1.1"\n   inkscape:version="0.48.4 r9939"\n   sodipodi:docname="Neues Dokument 1">\n  <defs\n     id="defs4" />\n  <sodipodi:namedview\n     id="base"\n     pagecolor="#ffffff"\n     bordercolor="#666666"\n     borderopacity="1.0"\n     inkscape:pageopacity="0.0"\n     inkscape:pageshadow="2"\n     inkscape:zoom="0.7"\n     inkscape:cx="152.17727"\n     inkscape:cy="403.43385"\n     inkscape:document-units="px"\n     inkscape:current-layer="layer1"\n     showgrid="false"\n     fit-margin-top="0"\n     fit-margin-left="0"\n     fit-margin-right="0"\n     fit-margin-bottom="0"\n     inkscape:window-width="990"\n     inkscape:window-height="755"\n     inkscape:window-x="212"\n     inkscape:window-y="147"\n     inkscape:window-maximized="0" />\n  <metadata\n     id="metadata7">\n    <rdf:RDF>\n      <cc:Work\n         rdf:about="">\n        <dc:format>image/svg+xml</dc:format>\n        <dc:type\n           rdf:resource="http://purl.org/dc/dcmitype/StillImage" />\n        <dc:title></dc:title>\n      </cc:Work>\n    </rdf:RDF>\n  </metadata>\n  <g\n     inkscape:label="Ebene 1"\n     inkscape:groupmode="layer"\n     id="layer1"\n     transform="translate(-0.92858593,0.42353161)">\n    <rect\n       style="fill:#ffffff;fill-rule:evenodd;stroke:#000000;stroke-width:0.27162996px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"\n       id="rect2985"\n       width="17.073883"\n       height="62.862934"\n       x="1.0644009"\n       y="-0.28771663" />\n    <rect\n       style="fill:#ffffff;fill-rule:evenodd;stroke:#000000;stroke-width:0.27162996px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"\n       id="rect2985-1"\n       width="17.073883"\n       height="62.862934"\n       x="1.6076443"\n       y="162.15042" />\n    <rect\n       style="fill:#ffffff;fill-rule:evenodd;stroke:#000000;stroke-width:0.27162996px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"\n       id="rect2985-7"\n       width="17.073883"\n       height="62.862934"\n       x="2.3449488"\n       y="341.08978" />\n    <rect\n       style="fill:#ffffff;fill-rule:evenodd;stroke:#000000;stroke-width:0.27162996px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"\n       id="rect2985-8"\n       width="17.073883"\n       height="62.862934"\n       x="2.2513592"\n       y="527.38483" />\n    <rect\n       style="fill:#ffffff;fill-rule:evenodd;stroke:#000000;stroke-width:0.27162996px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"\n       id="rect2985-1-2"\n       width="17.073883"\n       height="62.862934"\n       x="2.7946026"\n       y="689.823" />\n    <rect\n       style="fill:#ffffff;fill-rule:evenodd;stroke:#000000;stroke-width:0.27162996px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"\n       id="rect2985-7-4"\n       width="17.073883"\n       height="62.862934"\n       x="1.5319073"\n       y="868.76233" />\n  </g>\n</svg>\n	\N	25
\.


--
-- TOC entry 2062 (class 0 OID 0)
-- Dependencies: 171
-- Name: images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('images_id_seq', 1, true);


--
-- TOC entry 2035 (class 0 OID 16697)
-- Dependencies: 172
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY projects (id, name, description, width, ignore_segments, default_template) FROM stdin;
1	Testprojekt	Dies ist ein Testprojekt	10	\N	[{"id":2,"start_pos":0,"size":800,"fixed":true},{"id":4,"start_pos":800,"size":485},{"id":6,"start_pos":1285,"size":285},{"id":7,"start_pos":1570,"size":255},{"id":5,"start_pos":1825,"size":285},{"id":3,"start_pos":2110,"size":800,"fixed":true}]
\.


--
-- TOC entry 2063 (class 0 OID 0)
-- Dependencies: 173
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('projects_id_seq', 1, false);


--
-- TOC entry 2037 (class 0 OID 16705)
-- Dependencies: 174
-- Data for Name: segment_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY segment_types (id, name, description, rules, category) FROM stdin;
2	Haus	\N	\N	1
3	Randbepflanzung	\N	\N	2
4	Fahrspur	\N	\N	3
\.


--
-- TOC entry 2064 (class 0 OID 0)
-- Dependencies: 175
-- Name: segment_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('segment_types_id_seq', 1, false);


--
-- TOC entry 2039 (class 0 OID 16713)
-- Dependencies: 176
-- Data for Name: segments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY segments (id, name, description, available, type, image_id, image_top_id, image_ground_id, min_width, max_width, standard_width) FROM stdin;
8	Fahrbahnmarkierung gestrichelt	\N	t	1	11	11	8	25	\N	\N
2	Block links	\N	f	2	2	2	9	800	1000	\N
3	Block rechts	\N	f	2	3	3	9	800	1000	\N
4	test tree	test tree for test project	t	3	4	4	10	200	1000	\N
5	test tree 2	test tree for test project	t	3	5	5	10	200	1000	\N
6	Fahrspur links	\N	t	4	6	6	8	170	1000	\N
7	Fahrspur rechts	\N	t	4	7	7	8	170	1000	\N
\.


--
-- TOC entry 2065 (class 0 OID 0)
-- Dependencies: 177
-- Name: segments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('segments_id_seq', 5, true);


--
-- TOC entry 2041 (class 0 OID 16718)
-- Dependencies: 178
-- Data for Name: user_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY user_templates (id, project_id, user_id, template) FROM stdin;
\.


--
-- TOC entry 2066 (class 0 OID 0)
-- Dependencies: 179
-- Name: user_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('user_templates_id_seq', 1, false);


--
-- TOC entry 2043 (class 0 OID 16726)
-- Dependencies: 180
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY users (id, name, email, password, superuser) FROM stdin;
1	bla	bla@bla	blubb	f
2	admin	\N	1234	t
\.


--
-- TOC entry 2067 (class 0 OID 0)
-- Dependencies: 181
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('users_id_seq', 1, true);


--
-- TOC entry 1915 (class 2606 OID 16747)
-- Name: images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY images
    ADD CONSTRAINT images_pkey PRIMARY KEY (id);


--
-- TOC entry 1917 (class 2606 OID 16749)
-- Name: projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- TOC entry 1919 (class 2606 OID 16751)
-- Name: segment_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY segment_types
    ADD CONSTRAINT segment_types_pkey PRIMARY KEY (id);


--
-- TOC entry 1921 (class 2606 OID 16753)
-- Name: segments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY segments
    ADD CONSTRAINT segments_pkey PRIMARY KEY (id);


--
-- TOC entry 1923 (class 2606 OID 16755)
-- Name: user_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY user_templates
    ADD CONSTRAINT user_templates_pkey PRIMARY KEY (id);


--
-- TOC entry 1925 (class 2606 OID 16757)
-- Name: users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 2051 (class 0 OID 0)
-- Dependencies: 6
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


-- Completed on 2014-09-01 16:12:07 CEST

--
-- PostgreSQL database dump complete
--

