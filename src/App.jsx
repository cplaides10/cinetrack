import { useState, useMemo, useEffect, useRef } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://bhohbremearkvtbjyzls.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJob2hicmVtZWFya3Z0Ymp5emxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MTcxNTEsImV4cCI6MjA5NjA5MzE1MX0.2qBJccQxvLV6kEKUdX5UIf6aJYHCqrynVLYnWejEMA8";
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

const GENRES_DEFAULT = ["Acción","Aventura","Animación","Comedia","Crimen","Documental",
  "Drama","Fantasía","Terror","Misterio","Romance","Ciencia Ficción","Thriller","Western","Musical","Histórica","Bélica","Suspenso"];

const EMPTY_FORM = { title:"", year:"", director:"", genres:[], rating:3, poster:"", note:"", favorite:false };

const S = {
  bg:"#f5f0e8", sidebar:"#ede7db", card:"#fff",
  accent:"#C8803A", accentLight:"#f0e4d4",
  text:"#3a3228", muted:"#8a7d6e", border:"#ddd5c8",
  font:"'Lora','Georgia',serif", sans:"'DM Sans','Segoe UI',sans-serif",
};

const inputSt = {
  background:"#fff", border:`1px solid ${S.border}`, borderRadius:8,
  padding:"9px 13px", color:S.text, fontSize:13, fontFamily:S.sans,
  width:"100%", boxSizing:"border-box", outline:"none",
};

const SORT_OPTIONS = [
  { value:"manual",  label:"Manual" },
  { value:"added",   label:"Recientes" },
  { value:"title",   label:"A-Z" },
  { value:"year",    label:"Año" },
  { value:"rating",  label:"Calificación" },
];

const useIsMobile = () => {
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  useEffect(()=>{
    const fn = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  },[]);
  return mobile;
};

const HalfStars = ({ value, onChange, size=16 }) => (
  <span style={{display:"flex",gap:3,alignItems:"center"}}>
    {[1,2,3,4,5].map(n => {
      const full = value >= n, half = !full && value >= n-0.5;
      return (
        <span key={n} style={{position:"relative",fontSize:size,lineHeight:1,cursor:onChange?"pointer":"default",display:"inline-block",width:"1em"}}>
          <span style={{color:"#d9cfc4"}}>★</span>
          {(half||full)&&<span style={{position:"absolute",left:0,top:0,width:full?"100%":"50%",overflow:"hidden",color:"#C8803A"}}>★</span>}
          {onChange&&<span onClick={()=>onChange(n-0.5)} style={{position:"absolute",left:0,top:0,width:"50%",height:"100%",zIndex:1}}/>}
          {onChange&&<span onClick={()=>onChange(n)}     style={{position:"absolute",right:0,top:0,width:"50%",height:"100%",zIndex:1}}/>}
        </span>
      );
    })}
    {onChange&&<span style={{fontSize:size*0.75,color:S.muted,fontFamily:S.sans,marginLeft:4}}>{value}/5</span>}
  </span>
);

const Tag = ({ label, active, onClick, sm, onDelete }) => (
  <span style={{display:"inline-flex",alignItems:"center",gap:3,
    padding:sm?"2px 8px":"4px 12px",borderRadius:20,
    border:`1px solid ${active?"#C8803A":"#ccc4b8"}`,
    background:active?"#C8803A":"transparent",
    color:active?"#fff":"#8a7d6e",
    fontSize:sm?11:12,lineHeight:1.6,whiteSpace:"nowrap"}}>
    <span onClick={onClick} style={{cursor:"pointer"}}>{label}</span>
    {onDelete&&<span onClick={e=>{e.stopPropagation();onDelete();}} style={{cursor:"pointer",fontWeight:700,fontSize:10,opacity:.7,marginLeft:2}}>✕</span>}
  </span>
);

/* ══ MODALES ══ */
const FormModal = ({ form, setForm, formGenres, setFormGenres, editingId, onSave, onClose, allGenres }) => (
  <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:500,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
    <div onClick={e=>e.stopPropagation()} style={{background:S.bg,borderRadius:"16px 16px 0 0",width:"100%",maxWidth:600,maxHeight:"92vh",overflowY:"auto",padding:"24px 20px 32px"}}>
      <div style={{width:40,height:4,background:S.border,borderRadius:2,margin:"0 auto 20px"}}/>
      <h2 style={{fontFamily:S.font,fontSize:20,color:S.text,margin:"0 0 20px"}}>{editingId?"Editar película":"Agregar película"}</h2>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 90px",gap:10}}>
          <div>
            <label style={{fontSize:11,color:S.muted,fontFamily:S.sans,display:"block",marginBottom:5,letterSpacing:.4}}>TÍTULO *</label>
            <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Alien" style={inputSt}/>
          </div>
          <div>
            <label style={{fontSize:11,color:S.muted,fontFamily:S.sans,display:"block",marginBottom:5,letterSpacing:.4}}>AÑO</label>
            <input value={form.year} onChange={e=>setForm(f=>({...f,year:e.target.value}))} placeholder="1979" style={inputSt}/>
          </div>
        </div>
        <div>
          <label style={{fontSize:11,color:S.muted,fontFamily:S.sans,display:"block",marginBottom:5,letterSpacing:.4}}>DIRECTOR</label>
          <input value={form.director} onChange={e=>setForm(f=>({...f,director:e.target.value}))} placeholder="Ridley Scott" style={inputSt}/>
        </div>
        <div>
          <label style={{fontSize:11,color:S.muted,fontFamily:S.sans,display:"block",marginBottom:5,letterSpacing:.4}}>URL DEL PÓSTER (opcional)</label>
          <input value={form.poster} onChange={e=>setForm(f=>({...f,poster:e.target.value}))} placeholder="https://..." style={inputSt}/>
        </div>
        <div>
          <label style={{fontSize:11,color:S.muted,fontFamily:S.sans,display:"block",marginBottom:8,letterSpacing:.4}}>GÉNEROS <span style={{color:S.accent}}>({formGenres.length})</span></label>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {allGenres.map(g=>(
              <span key={g} onClick={()=>setFormGenres(p=>p.includes(g)?p.filter(x=>x!==g):[...p,g])}
                style={{padding:"3px 10px",borderRadius:20,border:`1px solid ${formGenres.includes(g)?"#C8803A":"#ccc4b8"}`,
                  background:formGenres.includes(g)?"#C8803A":"transparent",color:formGenres.includes(g)?"#fff":"#8a7d6e",
                  fontSize:12,cursor:"pointer",lineHeight:1.8,whiteSpace:"nowrap"}}>
                {g}
              </span>
            ))}
          </div>
        </div>
        <div>
          <label style={{fontSize:11,color:S.muted,fontFamily:S.sans,display:"block",marginBottom:8,letterSpacing:.4}}>CALIFICACIÓN</label>
          <HalfStars value={form.rating} onChange={v=>setForm(f=>({...f,rating:v}))} size={28}/>
        </div>
        <div>
          <label style={{fontSize:11,color:S.muted,fontFamily:S.sans,display:"block",marginBottom:5,letterSpacing:.4}}>NOTAS (opcional)</label>
          <textarea value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} placeholder="Tu reseña personal..." rows={3} style={{...inputSt,resize:"vertical"}}/>
        </div>
        <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontFamily:S.sans,fontSize:14,color:S.text}}>
          <input type="checkbox" checked={form.favorite} onChange={e=>setForm(f=>({...f,favorite:e.target.checked}))} style={{accentColor:S.accent,width:16,height:16}}/>
          Marcar como favorita
        </label>
        <div style={{display:"flex",gap:10,marginTop:4}}>
          <button onClick={onSave} disabled={!form.title.trim()} style={{flex:1,background:form.title.trim()?S.accent:"#ccc",border:"none",borderRadius:10,padding:"13px 0",color:"#fff",fontFamily:S.sans,fontSize:15,fontWeight:600,cursor:form.title.trim()?"pointer":"default"}}>
            {editingId?"Guardar cambios":"Agregar película"}
          </button>
          <button onClick={onClose} style={{background:"transparent",border:`1px solid ${S.border}`,borderRadius:10,padding:"13px 20px",color:S.muted,fontFamily:S.sans,fontSize:14,cursor:"pointer"}}>Cancelar</button>
        </div>
      </div>
    </div>
  </div>
);

const ManageTagsModal = ({ allGenres, onAdd, onDelete, onClose }) => {
  const [newTag, setNewTag] = useState("");
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:500,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:S.bg,borderRadius:"16px 16px 0 0",width:"100%",maxWidth:600,maxHeight:"80vh",overflowY:"auto",padding:"24px 20px 32px"}}>
        <div style={{width:40,height:4,background:S.border,borderRadius:2,margin:"0 auto 20px"}}/>
        <h2 style={{fontFamily:S.font,fontSize:18,color:S.text,margin:"0 0 16px"}}>Gestionar etiquetas</h2>
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          <input value={newTag} onChange={e=>setNewTag(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&newTag.trim()){onAdd(newTag.trim());setNewTag("");}}}
            placeholder="Nueva etiqueta..." style={{...inputSt,flex:1}}/>
          <button onClick={()=>{if(newTag.trim()){onAdd(newTag.trim());setNewTag("");}}} style={{background:S.accent,border:"none",borderRadius:8,padding:"9px 16px",color:"#fff",fontFamily:S.sans,fontSize:13,fontWeight:600,cursor:"pointer",flexShrink:0}}>+</button>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:20}}>
          {allGenres.map(g=><Tag key={g} label={g} active sm onDelete={()=>onDelete(g)}/>)}
        </div>
        <button onClick={onClose} style={{width:"100%",background:"transparent",border:`1px solid ${S.border}`,borderRadius:10,padding:"12px 0",color:S.muted,fontFamily:S.sans,fontSize:14,cursor:"pointer"}}>Cerrar</button>
      </div>
    </div>
  );
};

const NewListModal = ({ name, setName, desc, setDesc, onCreate, onClose }) => (
  <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:500,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
    <div onClick={e=>e.stopPropagation()} style={{background:S.bg,borderRadius:"16px 16px 0 0",width:"100%",maxWidth:600,padding:"24px 20px 32px"}}>
      <div style={{width:40,height:4,background:S.border,borderRadius:2,margin:"0 auto 20px"}}/>
      <h2 style={{fontFamily:S.font,fontSize:18,color:S.text,margin:"0 0 18px"}}>Nueva lista</h2>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nombre de la lista..." style={inputSt}/>
        <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Descripción (opcional)..." style={inputSt}/>
        <div style={{display:"flex",gap:10,marginTop:4}}>
          <button onClick={onCreate} disabled={!name.trim()} style={{flex:1,background:name.trim()?S.accent:"#ccc",border:"none",borderRadius:10,padding:"13px 0",color:"#fff",fontFamily:S.sans,fontSize:14,fontWeight:600,cursor:name.trim()?"pointer":"default"}}>Crear lista</button>
          <button onClick={onClose} style={{background:"transparent",border:`1px solid ${S.border}`,borderRadius:10,padding:"13px 20px",color:S.muted,fontFamily:S.sans,fontSize:14,cursor:"pointer"}}>Cancelar</button>
        </div>
      </div>
    </div>
  </div>
);

const AddToListModal = ({ movie, lists, onToggle, onClose }) => {
  if(!movie) return null;
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:500,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:S.bg,borderRadius:"16px 16px 0 0",width:"100%",maxWidth:600,maxHeight:"70vh",overflowY:"auto",padding:"24px 20px 32px"}}>
        <div style={{width:40,height:4,background:S.border,borderRadius:2,margin:"0 auto 20px"}}/>
        <h3 style={{fontFamily:S.font,fontSize:16,color:S.text,margin:"0 0 4px"}}>Agregar a una lista</h3>
        <div style={{fontSize:12,color:S.muted,fontFamily:S.sans,marginBottom:16}}>{movie.title}</div>
        {lists.length===0
          ?<div style={{fontSize:13,color:S.muted,fontFamily:S.sans,marginBottom:12}}>No tenés listas aún.</div>
          :lists.map(l=>(
            <div key={l.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${S.border}`}}>
              <span style={{fontSize:14,fontFamily:S.sans,color:S.text}}>{l.name}</span>
              <button onClick={()=>onToggle(l.id,movie.id)} style={{background:l.movieIds?.includes(movie.id)?S.accentLight:"transparent",border:`1px solid ${l.movieIds?.includes(movie.id)?S.accent:S.border}`,borderRadius:8,padding:"6px 14px",color:l.movieIds?.includes(movie.id)?S.accent:S.muted,fontFamily:S.sans,fontSize:13,cursor:"pointer"}}>
                {l.movieIds?.includes(movie.id)?"Quitar":"Agregar"}
              </button>
            </div>
          ))
        }
        <button onClick={onClose} style={{marginTop:16,width:"100%",background:"transparent",border:`1px solid ${S.border}`,borderRadius:10,padding:"12px 0",color:S.muted,fontFamily:S.sans,fontSize:14,cursor:"pointer"}}>Cerrar</button>
      </div>
    </div>
  );
};

/* Panel de detalle como bottom sheet en mobile */
const DetailSheet = ({ movie, onClose, onEdit, onDelete, onAddToList, onToggleFav, lists }) => {
  if(!movie) return null;
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:400,display:"flex",alignItems:"flex-end"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:S.card,borderRadius:"16px 16px 0 0",width:"100%",maxHeight:"85vh",overflowY:"auto",display:"flex",flexDirection:"column"}}>
        <div style={{width:40,height:4,background:S.border,borderRadius:2,margin:"12px auto 0"}}/>
        <div style={{display:"flex",gap:16,padding:"16px 16px 0"}}>
          <div style={{flexShrink:0,width:90,borderRadius:8,overflow:"hidden",background:"#e8dfd4"}}>
            {movie.poster?<img src={movie.poster} alt={movie.title} style={{width:"100%",aspectRatio:"2/3",objectFit:"cover",display:"block"}} onError={e=>e.target.style.display="none"}/>
              :<div style={{aspectRatio:"2/3",display:"flex",alignItems:"center",justifyContent:"center",color:S.muted,fontSize:10,fontFamily:S.sans}}>Sin póster</div>}
          </div>
          <div style={{flex:1}}>
            <div style={{fontFamily:S.font,fontSize:18,fontWeight:700,color:S.text,lineHeight:1.3,marginBottom:4}}>{movie.title}</div>
            <div style={{fontSize:12,color:S.muted,fontFamily:S.sans,marginBottom:8}}>Dir. {movie.director} · {movie.year}</div>
            <HalfStars value={movie.rating} size={16}/>
            <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:8}}>
              {(movie.genres||[]).map(g=><Tag key={g} label={g} active sm/>)}
            </div>
          </div>
        </div>
        {movie.note&&<div style={{margin:"12px 16px 0",fontSize:13,color:S.muted,fontFamily:S.sans,fontStyle:"italic",lineHeight:1.6}}>"{movie.note}"</div>}
        <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:10}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <button onClick={()=>onToggleFav(movie.id)} style={{background:movie.favorite?S.accentLight:"transparent",border:`1px solid ${movie.favorite?S.accent:S.border}`,borderRadius:10,padding:"11px 0",color:movie.favorite?S.accent:S.muted,fontFamily:S.sans,fontSize:13,cursor:"pointer",fontWeight:movie.favorite?600:400}}>
              {movie.favorite?"♥ Favorita":"♡ Favorita"}
            </button>
            <button onClick={()=>onAddToList(movie.id)} style={{background:"transparent",border:`1px solid ${S.border}`,borderRadius:10,padding:"11px 0",color:S.text,fontFamily:S.sans,fontSize:13,cursor:"pointer"}}>Agregar a lista</button>
          </div>
          <button onClick={()=>onEdit(movie)} style={{background:S.accent,border:"none",borderRadius:10,padding:"13px 0",color:"#fff",fontFamily:S.sans,fontSize:14,cursor:"pointer",fontWeight:600}}>Editar película</button>
          <button onClick={()=>{if(window.confirm(`¿Eliminar "${movie.title}"?`)){onDelete(movie.id);onClose();}}} style={{background:"#fdeaea",border:"1px solid #e0a0a0",borderRadius:10,padding:"13px 0",color:"#b06060",fontFamily:S.sans,fontSize:14,cursor:"pointer",fontWeight:600}}>Eliminar película</button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════ MAIN APP ══════════════════════════════════════ */
export default function CineTrack() {
  const isMobile = useIsMobile();
  const [movies,    setMovies]    = useState([]);
  const [lists,     setLists]     = useState([]);
  const [allGenres, setAllGenres] = useState(GENRES_DEFAULT);
  const [loading,   setLoading]   = useState(true);

  const [tab,          setTab]          = useState("biblioteca");
  const [selectedId,   setSelectedId]   = useState(null);
  const [search,       setSearch]       = useState("");
  const [activeTag,    setActiveTag]    = useState("Todo");
  const [filterGenres, setFilterGenres] = useState([]);
  const [filterMode,   setFilterMode]   = useState("OR");
  const [sort,         setSort]         = useState("manual");
  const [showSearch,   setShowSearch]   = useState(false);
  const [showFilters,  setShowFilters]  = useState(false);

  const [showForm,       setShowForm]       = useState(false);
  const [editingId,      setEditingId]      = useState(null);
  const [form,           setForm]           = useState(EMPTY_FORM);
  const [formGenres,     setFormGenres]     = useState([]);
  const [showListModal,  setShowListModal]  = useState(false);
  const [newListName,    setNewListName]    = useState("");
  const [newListDesc,    setNewListDesc]    = useState("");
  const [activeList,     setActiveList]     = useState(null);
  const [addToListMovie, setAddToListMovie] = useState(null);
  const [showTagsModal,  setShowTagsModal]  = useState(false);
  const [detailMovie,    setDetailMovie]    = useState(null);
  const [showSidebar,    setShowSidebar]    = useState(false);

  useEffect(()=>{
    const load = async () => {
      setLoading(true);
      const [{ data:mv },{ data:ls },{ data:lm },{ data:gn }] = await Promise.all([
        sb.from("movies").select("*").order("sort_order",{ascending:true}).order("created_at",{ascending:true}),
        sb.from("lists").select("*").order("created_at"),
        sb.from("list_movies").select("*"),
        sb.from("genres").select("*"),
      ]);
      const listsWithIds=(ls||[]).map(l=>({...l,movieIds:(lm||[]).filter(x=>x.list_id===l.id).map(x=>x.movie_id)}));
      setMovies(mv||[]);
      setLists(listsWithIds);
      if(gn&&gn.length>0) setAllGenres(gn.map(g=>g.name));
      if(mv&&mv.length>0) setSelectedId(mv[0].id);
      setLoading(false);
    };
    load();
  },[]);

  const selected    = movies.find(m=>m.id===selectedId)||null;
  const allTags     = ["Todo","Favoritas",...allGenres];
  const currentList = lists.find(l=>l.id===activeList);

  const filteredMovies = useMemo(()=>{
    let pool=[...movies];
    if(tab==="listas"&&activeList){ const lst=lists.find(l=>l.id===activeList); if(lst) pool=pool.filter(m=>lst.movieIds.includes(m.id)); }
    if(tab==="favoritas") pool=pool.filter(m=>m.favorite);
    if(search) pool=pool.filter(m=>m.title.toLowerCase().includes(search.toLowerCase())||(m.director||"").toLowerCase().includes(search.toLowerCase()));
    if(tab==="biblioteca"){
      if(activeTag==="Favoritas") pool=pool.filter(m=>m.favorite);
      else if(activeTag!=="Todo") pool=pool.filter(m=>m.genres?.includes(activeTag));
      if(filterGenres.length) pool=pool.filter(m=>filterMode==="AND"?filterGenres.every(g=>m.genres?.includes(g)):filterGenres.some(g=>m.genres?.includes(g)));
    }
    return pool;
  },[movies,lists,tab,activeList,search,activeTag,filterGenres,filterMode]);

  const sortedMovies = useMemo(()=>{
    if(sort==="manual") return filteredMovies;
    return [...filteredMovies].sort((a,b)=>{
      if(sort==="title")  return a.title.localeCompare(b.title);
      if(sort==="year")   return (b.year||0)-(a.year||0);
      if(sort==="rating") return b.rating-a.rating;
      if(sort==="added")  return new Date(b.created_at)-new Date(a.created_at);
      return 0;
    });
  },[filteredMovies,sort]);

  const toggleFav = async (id) => {
    const m=movies.find(x=>x.id===id);
    await sb.from("movies").update({favorite:!m.favorite}).eq("id",id);
    setMovies(p=>p.map(x=>x.id===id?{...x,favorite:!x.favorite}:x));
    setDetailMovie(d=>d?.id===id?{...d,favorite:!d.favorite}:d);
  };

  const deleteMovie = async (id) => {
    await sb.from("movies").delete().eq("id",id);
    setMovies(p=>p.filter(m=>m.id!==id));
    setLists(p=>p.map(l=>({...l,movieIds:l.movieIds.filter(x=>x!==id)})));
    if(selectedId===id) setSelectedId(null);
  };

  const openAdd  = ()=>{ setForm(EMPTY_FORM); setFormGenres([]); setEditingId(null); setShowForm(true); };
  const openEdit = (m)=>{ setForm({title:m.title,year:m.year||"",director:m.director||"",rating:m.rating,poster:m.poster||"",note:m.note||"",favorite:m.favorite}); setFormGenres([...(m.genres||[])]); setEditingId(m.id); setShowForm(true); setDetailMovie(null); };

  const saveMovie = async () => {
    if(!form.title.trim()) return;
    const data={...form,genres:formGenres};
    if(editingId){
      await sb.from("movies").update(data).eq("id",editingId);
      setMovies(p=>p.map(m=>m.id===editingId?{...m,...data}:m));
    } else {
      const {data:nm}=await sb.from("movies").insert({...data,sort_order:movies.length}).select().single();
      if(nm){ setMovies(p=>[...p,nm]); setSelectedId(nm.id); }
    }
    setShowForm(false);
  };

  const createList = async () => {
    if(!newListName.trim()) return;
    const {data:nl}=await sb.from("lists").insert({name:newListName,description:newListDesc}).select().single();
    if(nl){ setLists(p=>[...p,{...nl,movieIds:[]}]); setNewListName(""); setNewListDesc(""); setShowListModal(false); setTab("listas"); setActiveList(nl.id); setShowSidebar(false); }
  };

  const deleteList = async (id) => {
    await sb.from("lists").delete().eq("id",id);
    setLists(p=>p.filter(l=>l.id!==id));
    if(activeList===id) setActiveList(null);
  };

  const toggleMovieInList = async (listId,movieId) => {
    const lst=lists.find(l=>l.id===listId);
    if(lst.movieIds.includes(movieId)){
      await sb.from("list_movies").delete().eq("list_id",listId).eq("movie_id",movieId);
      setLists(p=>p.map(l=>l.id===listId?{...l,movieIds:l.movieIds.filter(x=>x!==movieId)}:l));
    } else {
      await sb.from("list_movies").insert({list_id:listId,movie_id:movieId});
      setLists(p=>p.map(l=>l.id===listId?{...l,movieIds:[...l.movieIds,movieId]}:l));
    }
  };

  const addGenre    = async (name) => { if(allGenres.includes(name)) return; await sb.from("genres").insert({name}); setAllGenres(p=>[...p,name]); };
  const deleteGenre = async (name) => { await sb.from("genres").delete().eq("name",name); setAllGenres(p=>p.filter(g=>g!==name)); };

  const handleReorder = async (reordered) => {
    setMovies(prev => {
      const map = Object.fromEntries(prev.map(m=>[m.id,m]));
      const updated = reordered.map((m,i)=>({...map[m.id],sort_order:i}));
      const reorderedIds = new Set(reordered.map(m=>m.id));
      const rest = prev.filter(m=>!reorderedIds.has(m.id));
      return [...updated,...rest].sort((a,b)=>(a.sort_order??999)-(b.sort_order??999));
    });
    await Promise.all(reordered.map((m,i)=>sb.from("movies").update({sort_order:i}).eq("id",m.id)));
  };

  const navItems=[{id:"biblioteca",label:"Biblioteca"},{id:"favoritas",label:"Favoritas"},{id:"listas",label:"Listas"},{id:"estadisticas",label:"Estadísticas"}];

  /* ── GRID ── */
  const dragId = useRef(null);
  const [dragOver, setDragOver] = useState(null);
  const handleDrop = (targetId) => {
    if(!dragId.current||dragId.current===targetId) return;
    const ids = sortedMovies.map(m=>m.id);
    const from = ids.indexOf(dragId.current), to = ids.indexOf(targetId);
    const reordered = [...sortedMovies];
    const [moved] = reordered.splice(from,1);
    reordered.splice(to,0,moved);
    handleReorder(reordered);
    dragId.current=null; setDragOver(null);
  };

  const Grid = () => (
    <div style={{display:"grid",gridTemplateColumns:isMobile?"repeat(auto-fill,minmax(100px,1fr))":"repeat(auto-fill,minmax(140px,1fr))",gap:isMobile?10:16,padding:"0 0 100px"}}>
      {sortedMovies.map(m=>(
        <div key={m.id}
          draggable={sort==="manual"&&!isMobile}
          onDragStart={()=>{ dragId.current=m.id; }}
          onDragOver={e=>{ e.preventDefault(); setDragOver(m.id); }}
          onDragLeave={()=>setDragOver(null)}
          onDrop={()=>handleDrop(m.id)}
          onClick={()=>{ if(isMobile){ setDetailMovie(m); } else { setSelectedId(m.id); } }}
          style={{
            background:S.card,borderRadius:10,overflow:"hidden",
            cursor:"pointer",
            border:`2px solid ${!isMobile&&selectedId===m.id?S.accent:dragOver===m.id?"#a0785a":S.border}`,
            transition:"border-color .15s,transform .15s",
            boxShadow:"0 1px 4px rgba(0,0,0,.06)",
          }}
          onMouseEnter={e=>{if(!isMobile&&selectedId!==m.id)e.currentTarget.style.borderColor="#c4b8a8";if(!isMobile)e.currentTarget.style.transform="translateY(-2px)";}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=!isMobile&&selectedId===m.id?S.accent:S.border;e.currentTarget.style.transform="";}}>
          <div style={{position:"relative",aspectRatio:"2/3",background:"#e8dfd4"}}>
            {m.poster?<img src={m.poster} alt={m.title} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} onError={e=>e.target.style.display="none"}/>
              :<div style={{height:"100%",display:"flex",alignItems:"center",justifyContent:"center",color:S.muted,fontSize:10,fontFamily:S.sans,textAlign:"center",padding:4}}>Sin póster</div>}
            {m.favorite&&<div style={{position:"absolute",top:4,left:4,background:S.accent,color:"#fff",fontSize:8,padding:"2px 5px",borderRadius:8,fontFamily:S.sans}}>Fav</div>}
          </div>
          <div style={{padding:isMobile?"6px 7px 8px":"9px 10px 11px"}}>
            <div style={{fontSize:isMobile?11:12,fontFamily:S.font,fontWeight:700,color:S.text,lineHeight:1.3,marginBottom:2}}>{m.title}</div>
            <div style={{fontSize:9,color:S.muted,fontFamily:S.sans,marginBottom:4}}>{m.year}</div>
            <HalfStars value={m.rating} size={isMobile?10:11}/>
          </div>
        </div>
      ))}
      {sortedMovies.length===0&&(
        <div style={{gridColumn:"1/-1",padding:"60px 0",textAlign:"center",color:S.muted,fontFamily:S.sans,fontSize:13}}>
          No se encontraron películas
        </div>
      )}
    </div>
  );

  /* ── STATS ── */
  const Stats = () => {
    const genreCount={};
    movies.forEach(m=>(m.genres||[]).forEach(g=>{genreCount[g]=(genreCount[g]||0)+1;}));
    const dirCount={};
    movies.forEach(m=>{if(m.director)dirCount[m.director]=(dirCount[m.director]||0)+1;});
    const avg=movies.length?(movies.reduce((a,m)=>a+m.rating,0)/movies.length).toFixed(1):0;
    const topG=Object.entries(genreCount).sort((a,b)=>b[1]-a[1]).slice(0,7);
    const topD=Object.entries(dirCount).sort((a,b)=>b[1]-a[1]).slice(0,5);
    return(
      <div style={{padding:isMobile?"16px 0 100px":"28px 32px",overflowY:"auto",flex:1}}>
        {!isMobile&&<h2 style={{fontFamily:S.font,fontSize:22,color:S.text,margin:"0 0 24px"}}>Estadísticas</h2>}
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)",gap:12,marginBottom:20}}>
          {[["Películas",movies.length],[`Promedio`,`${avg}/5`],["Favoritas",movies.filter(m=>m.favorite).length],["Listas",lists.length]].map(([l,v])=>(
            <div key={l} style={{background:S.card,border:`1px solid ${S.border}`,borderRadius:12,padding:"14px 16px"}}>
              <div style={{fontFamily:S.font,fontSize:22,fontWeight:700,color:S.accent,marginBottom:2}}>{v}</div>
              <div style={{fontSize:11,color:S.muted,fontFamily:S.sans}}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:16}}>
          <div style={{background:S.card,border:`1px solid ${S.border}`,borderRadius:12,padding:"16px 20px"}}>
            <h3 style={{margin:"0 0 14px",fontSize:12,color:S.muted,fontFamily:S.sans,letterSpacing:.5}}>GÉNEROS MÁS VISTOS</h3>
            {topG.length===0?<div style={{fontSize:13,color:S.muted,fontFamily:S.sans}}>Sin datos</div>:topG.map(([g,c],i)=>(
              <div key={g} style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                  <span style={{fontSize:12,fontFamily:S.sans,color:S.text}}>{g}</span>
                  <span style={{fontSize:11,fontFamily:S.sans,color:S.accent}}>{c}</span>
                </div>
                <div style={{height:4,background:"#ede7db",borderRadius:3}}>
                  <div style={{height:"100%",width:`${(c/topG[0][1])*100}%`,background:S.accent,borderRadius:3,opacity:1-i*.1}}/>
                </div>
              </div>
            ))}
          </div>
          <div style={{background:S.card,border:`1px solid ${S.border}`,borderRadius:12,padding:"16px 20px"}}>
            <h3 style={{margin:"0 0 14px",fontSize:12,color:S.muted,fontFamily:S.sans,letterSpacing:.5}}>DIRECTORES FRECUENTES</h3>
            {topD.length===0?<div style={{fontSize:13,color:S.muted,fontFamily:S.sans}}>Sin datos</div>:topD.map(([d,c])=>(
              <div key={d} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${S.border}`}}>
                <span style={{fontSize:12,fontFamily:S.sans,color:S.text}}>{d}</span>
                <span style={{fontSize:11,fontFamily:S.sans,background:S.accentLight,color:S.accent,padding:"2px 8px",borderRadius:20}}>{c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  /* ── DETAIL PANEL (desktop) ── */
  const DetailPanel = () => {
    const movie=selected;
    if(!movie) return(
      <div style={{flex:"0 0 260px",background:S.card,borderLeft:`1px solid ${S.border}`,display:"flex",alignItems:"center",justifyContent:"center",color:S.muted,fontSize:13,fontFamily:S.sans}}>
        Seleccioná una película
      </div>
    );
    return(
      <div style={{flex:"0 0 260px",background:S.card,borderLeft:`1px solid ${S.border}`,overflowY:"auto",display:"flex",flexDirection:"column"}}>
        <div style={{position:"relative",flexShrink:0}}>
          {movie.poster?<img src={movie.poster} alt={movie.title} style={{width:"100%",aspectRatio:"2/3",objectFit:"cover",display:"block"}} onError={e=>e.target.style.display="none"}/>
            :<div style={{width:"100%",aspectRatio:"2/3",background:"#e8dfd4",display:"flex",alignItems:"center",justifyContent:"center",color:S.muted,fontSize:13,fontFamily:S.sans}}>Sin póster</div>}
          <button onClick={()=>toggleFav(movie.id)} style={{position:"absolute",top:10,right:10,background:"rgba(255,255,255,.85)",border:`1px solid ${S.border}`,borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:11,fontFamily:S.sans,color:movie.favorite?S.accent:S.muted}}>
            {movie.favorite?"♥ Favorita":"♡ Favorita"}
          </button>
        </div>
        <div style={{padding:"16px 16px 20px",display:"flex",flexDirection:"column",gap:10}}>
          <div style={{fontFamily:S.font,fontSize:17,fontWeight:700,color:S.text,lineHeight:1.3}}>{movie.title}</div>
          <div style={{fontSize:12,color:S.muted,fontFamily:S.sans}}>Dir. {movie.director} · {movie.year}</div>
          <HalfStars value={movie.rating} size={16}/>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{(movie.genres||[]).map(g=><Tag key={g} label={g} active sm/>)}</div>
          {movie.note&&<div style={{fontSize:12,color:S.muted,fontFamily:S.sans,fontStyle:"italic",lineHeight:1.6,borderTop:`1px solid ${S.border}`,paddingTop:10}}>"{movie.note}"</div>}
          <button onClick={()=>openEdit(movie)} style={{background:S.accent,border:"none",borderRadius:8,padding:"9px 0",color:"#fff",fontFamily:S.sans,fontSize:13,cursor:"pointer",fontWeight:600}}>Editar película</button>
          <button onClick={()=>setAddToListMovie(movie.id)} style={{background:"transparent",border:`1px solid ${S.border}`,borderRadius:8,padding:"9px 0",color:S.text,fontFamily:S.sans,fontSize:13,cursor:"pointer"}}>Agregar a lista</button>
          <button onClick={()=>{if(window.confirm(`¿Eliminar "${movie.title}"?`))deleteMovie(movie.id);}} style={{background:"#fdeaea",border:"1px solid #e0a0a0",borderRadius:8,padding:"9px 0",color:"#b06060",fontFamily:S.sans,fontSize:13,cursor:"pointer",fontWeight:600}}>Eliminar película</button>
          {lists.filter(l=>l.movieIds?.includes(movie.id)).length>0&&(
            <div style={{borderTop:`1px solid ${S.border}`,paddingTop:10}}>
              <div style={{fontSize:11,color:S.muted,fontFamily:S.sans,marginBottom:6,letterSpacing:.5}}>EN TUS LISTAS</div>
              {lists.filter(l=>l.movieIds?.includes(movie.id)).map(l=>(
                <div key={l.id} style={{fontSize:12,fontFamily:S.sans,color:S.accent,marginBottom:3}}>· {l.name}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if(loading) return(
    <div style={{minHeight:"100vh",background:S.bg,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
      <div style={{fontFamily:S.font,fontSize:24,color:S.accent}}>CineTrack</div>
      <div style={{fontSize:13,color:S.muted,fontFamily:S.sans}}>Cargando tu colección...</div>
    </div>
  );

  /* ════════════ MOBILE LAYOUT ════════════ */
  if(isMobile) return(
    <div style={{minHeight:"100vh",background:S.bg,fontFamily:S.sans}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        ::-webkit-scrollbar{display:none;} input:focus,textarea:focus{border-color:#C8803A !important;outline:none;} input::placeholder,textarea::placeholder{color:#b8ad9e;}`}
      </style>

      {/* TOP BAR mobile */}
      <div style={{background:S.sidebar,borderBottom:`1px solid ${S.border}`,height:54,display:"flex",alignItems:"center",padding:"0 16px",gap:10,position:"sticky",top:0,zIndex:100}}>
        <button onClick={()=>setShowSidebar(true)} style={{background:"transparent",border:"none",fontSize:20,cursor:"pointer",color:S.text,padding:"4px 6px",lineHeight:1}}>☰</button>
        <div style={{fontFamily:"'Lora',serif",fontSize:17,fontWeight:700,color:S.accent,flex:1}}>
          {tab==="biblioteca"?"Biblioteca":tab==="favoritas"?"Favoritas":tab==="listas"?currentList?.name||"Listas":"Estadísticas"}
        </div>
        <button onClick={()=>setShowSearch(s=>!s)} style={{background:"transparent",border:"none",fontSize:16,cursor:"pointer",color:S.muted,padding:"4px 6px"}}>🔍</button>
        <button onClick={openAdd} style={{background:S.accent,border:"none",borderRadius:8,padding:"7px 12px",color:"#fff",fontFamily:S.sans,fontSize:12,fontWeight:600,cursor:"pointer"}}>+ Agregar</button>
      </div>

      {/* Search bar mobile */}
      {showSearch&&<div style={{padding:"10px 16px",background:S.sidebar,borderBottom:`1px solid ${S.border}`}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar título o director..." style={{...inputSt}} autoFocus/>
      </div>}

      {/* Tag filter mobile */}
      {tab==="biblioteca"&&(
        <div style={{background:S.bg,borderBottom:`1px solid ${S.border}`,padding:"10px 16px 0"}}>
          <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:10}}>
            {allTags.map(t=>(
              <button key={t} onClick={()=>setActiveTag(t)}
                style={{background:activeTag===t?S.accent:"transparent",border:`1px solid ${activeTag===t?S.accent:S.border}`,borderRadius:20,padding:"5px 14px",color:activeTag===t?"#fff":S.muted,fontFamily:S.sans,fontSize:12,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>
                {t}
              </button>
            ))}
          </div>
          {/* Sort mobile */}
          <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:10}}>
            {SORT_OPTIONS.map(o=>(
              <button key={o.value} onClick={()=>setSort(o.value)}
                style={{background:sort===o.value?S.accent:"transparent",border:`1px solid ${sort===o.value?S.accent:S.border}`,borderRadius:20,padding:"3px 12px",color:sort===o.value?"#fff":S.muted,fontFamily:S.sans,fontSize:11,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}
      {(tab==="favoritas"||tab==="listas")&&(
        <div style={{background:S.bg,borderBottom:`1px solid ${S.border}`,padding:"8px 16px"}}>
          <div style={{display:"flex",gap:5,overflowX:"auto"}}>
            {SORT_OPTIONS.map(o=>(
              <button key={o.value} onClick={()=>setSort(o.value)}
                style={{background:sort===o.value?S.accent:"transparent",border:`1px solid ${sort===o.value?S.accent:S.border}`,borderRadius:20,padding:"3px 12px",color:sort===o.value?"#fff":S.muted,fontFamily:S.sans,fontSize:11,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content mobile */}
      <div style={{padding:"16px 16px 0"}}>
        {tab==="estadisticas"?<Stats/>
          :tab==="listas"&&!currentList?(
            <div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:80}}>
                {lists.map(l=>(
                  <div key={l.id} onClick={()=>setActiveList(l.id)} style={{background:S.card,border:`1px solid ${S.border}`,borderRadius:10,padding:"14px 16px",cursor:"pointer"}}>
                    <div style={{fontFamily:"'Lora',serif",fontSize:14,fontWeight:700,color:S.text,marginBottom:3}}>{l.name}</div>
                    <div style={{fontSize:11,color:S.muted}}>{l.description}</div>
                    <div style={{fontSize:11,color:S.accent,marginTop:6}}>{l.movieIds.length} película{l.movieIds.length!==1?"s":""}</div>
                  </div>
                ))}
                <div onClick={()=>setShowListModal(true)} style={{background:"transparent",border:`2px dashed ${S.border}`,borderRadius:10,padding:"14px 16px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:S.muted,fontFamily:S.sans,fontSize:13}}>
                  + Nueva lista
                </div>
              </div>
            </div>
          ):<Grid/>}
      </div>

      {/* Bottom nav mobile */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:S.sidebar,borderTop:`1px solid ${S.border}`,display:"flex",zIndex:100}}>
        {navItems.map(n=>(
          <button key={n.id} onClick={()=>{setTab(n.id);if(n.id!=="listas")setActiveList(null);}}
            style={{flex:1,background:"transparent",border:"none",padding:"10px 0 14px",color:tab===n.id?S.accent:S.muted,fontFamily:S.sans,fontSize:10,cursor:"pointer",fontWeight:tab===n.id?700:400,borderTop:`2px solid ${tab===n.id?S.accent:"transparent"}`}}>
            {n.label}
          </button>
        ))}
      </div>

      {/* Sidebar drawer mobile */}
      {showSidebar&&(
        <div onClick={()=>setShowSidebar(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.4)",zIndex:300}}>
          <div onClick={e=>e.stopPropagation()} style={{position:"absolute",left:0,top:0,bottom:0,width:220,background:S.sidebar,padding:"20px 0",overflowY:"auto"}}>
            <div style={{fontFamily:"'Lora',serif",fontSize:17,fontWeight:700,color:S.accent,padding:"0 20px 16px"}}>CineTrack</div>
            {navItems.map(n=>(
              <button key={n.id} onClick={()=>{setTab(n.id);setShowSidebar(false);if(n.id!=="listas")setActiveList(null);}}
                style={{background:tab===n.id?S.accentLight:"transparent",border:"none",borderLeft:`3px solid ${tab===n.id?S.accent:"transparent"}`,padding:"12px 20px",color:tab===n.id?S.accent:S.muted,fontFamily:S.sans,fontSize:14,fontWeight:tab===n.id?600:400,cursor:"pointer",textAlign:"left",width:"100%"}}>
                {n.label}
              </button>
            ))}
            <div style={{margin:"16px 16px 8px",height:1,background:S.border}}/>
            <div style={{padding:"4px 20px 8px",fontSize:11,color:S.muted,letterSpacing:.5}}>MIS LISTAS</div>
            {lists.map(l=>(
              <button key={l.id} onClick={()=>{setTab("listas");setActiveList(l.id);setShowSidebar(false);}}
                style={{background:"transparent",border:"none",borderLeft:"3px solid transparent",padding:"10px 20px",color:S.muted,fontFamily:S.sans,fontSize:13,cursor:"pointer",textAlign:"left",width:"100%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                {l.name}
              </button>
            ))}
            <button onClick={()=>{setShowListModal(true);setShowSidebar(false);}} style={{background:"transparent",border:"none",padding:"10px 20px",color:S.accent,fontFamily:S.sans,fontSize:13,cursor:"pointer",textAlign:"left",width:"100%"}}>+ Nueva lista</button>
            <div style={{margin:"16px 16px 8px",height:1,background:S.border}}/>
            <button onClick={()=>{setShowTagsModal(true);setShowSidebar(false);}} style={{background:"transparent",border:"none",padding:"10px 20px",color:S.muted,fontFamily:S.sans,fontSize:13,cursor:"pointer",textAlign:"left",width:"100%"}}>Gestionar etiquetas</button>
          </div>
        </div>
      )}

      {/* Modales mobile */}
      {showForm&&<FormModal form={form} setForm={setForm} formGenres={formGenres} setFormGenres={setFormGenres} editingId={editingId} onSave={saveMovie} onClose={()=>setShowForm(false)} allGenres={allGenres}/>}
      {showListModal&&<NewListModal name={newListName} setName={setNewListName} desc={newListDesc} setDesc={setNewListDesc} onCreate={createList} onClose={()=>setShowListModal(false)}/>}
      {addToListMovie&&<AddToListModal movie={movies.find(m=>m.id===addToListMovie)} lists={lists} onToggle={toggleMovieInList} onClose={()=>setAddToListMovie(null)}/>}
      {showTagsModal&&<ManageTagsModal allGenres={allGenres} onAdd={addGenre} onDelete={deleteGenre} onClose={()=>setShowTagsModal(false)}/>}
      {detailMovie&&<DetailSheet movie={detailMovie} onClose={()=>setDetailMovie(null)} onEdit={openEdit} onDelete={deleteMovie} onAddToList={(id)=>{setAddToListMovie(id);setDetailMovie(null);}} onToggleFav={toggleFav} lists={lists}/>}
    </div>
  );

  /* ════════════ DESKTOP LAYOUT ════════════ */
  return(
    <div style={{minHeight:"100vh",background:S.bg,display:"flex",flexDirection:"column",fontFamily:S.sans}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        ::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:#ccc4b8;border-radius:3px;}
        input:focus,textarea:focus{border-color:#C8803A !important;outline:none;}input::placeholder,textarea::placeholder{color:#b8ad9e;}`}
      </style>
      <div style={{background:S.sidebar,borderBottom:`1px solid ${S.border}`,height:56,display:"flex",alignItems:"center",padding:"0 24px",gap:16,flexShrink:0}}>
        <div style={{fontFamily:"'Lora',serif",fontSize:18,fontWeight:700,color:S.accent,marginRight:12,whiteSpace:"nowrap"}}>CineTrack</div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar título o director..." style={{...inputSt,maxWidth:380,height:36}}/>
        <div style={{flex:1}}/>
        <button onClick={()=>setShowTagsModal(true)} style={{background:"transparent",border:`1px solid ${S.border}`,borderRadius:8,padding:"7px 14px",color:S.muted,fontFamily:S.sans,fontSize:13,cursor:"pointer",flexShrink:0}}>Etiquetas</button>
        <button onClick={openAdd} style={{background:S.accent,border:"none",borderRadius:8,padding:"8px 18px",color:"#fff",fontFamily:S.sans,fontSize:13,fontWeight:600,cursor:"pointer",flexShrink:0}}>+ Agregar película</button>
      </div>
      <div style={{flex:1,display:"flex",overflow:"hidden",minHeight:0}}>
        <div style={{width:160,background:S.sidebar,borderRight:`1px solid ${S.border}`,display:"flex",flexDirection:"column",padding:"20px 0",flexShrink:0,overflowY:"auto"}}>
          {navItems.map(n=>(
            <button key={n.id} onClick={()=>setTab(n.id)}
              style={{background:tab===n.id?S.accentLight:"transparent",border:"none",borderLeft:`3px solid ${tab===n.id?S.accent:"transparent"}`,padding:"11px 20px",color:tab===n.id?S.accent:S.muted,fontFamily:S.sans,fontSize:13,fontWeight:tab===n.id?600:400,cursor:"pointer",textAlign:"left",transition:"all .15s"}}>
              {n.label}
            </button>
          ))}
          <div style={{margin:"16px 16px 8px",height:1,background:S.border}}/>
          <div style={{padding:"4px 20px 8px",fontSize:11,color:S.muted,letterSpacing:.5}}>MIS LISTAS</div>
          {lists.map(l=>(
            <button key={l.id} onClick={()=>{setTab("listas");setActiveList(l.id);}}
              style={{background:tab==="listas"&&activeList===l.id?S.accentLight:"transparent",border:"none",borderLeft:`3px solid ${tab==="listas"&&activeList===l.id?S.accent:"transparent"}`,padding:"8px 20px",color:tab==="listas"&&activeList===l.id?S.accent:S.muted,fontFamily:S.sans,fontSize:12,cursor:"pointer",textAlign:"left",width:"100%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",transition:"all .15s"}}>
              {l.name}
            </button>
          ))}
          <button onClick={()=>setShowListModal(true)} style={{background:"transparent",border:"none",padding:"8px 20px",color:S.accent,fontFamily:S.sans,fontSize:12,cursor:"pointer",textAlign:"left"}}>+ Nueva lista</button>
        </div>
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>
          {(tab==="biblioteca"||tab==="favoritas"||tab==="listas")&&(
            <div style={{background:S.bg,borderBottom:`1px solid ${S.border}`,padding:"14px 24px 0",flexShrink:0}}>
              {tab==="listas"&&(
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                  <div>
                    <h2 style={{fontFamily:"'Lora',serif",fontSize:18,color:S.text,margin:0}}>{currentList?currentList.name:"Todas las listas"}</h2>
                    {currentList?.description&&<div style={{fontSize:12,color:S.muted,marginTop:2}}>{currentList.description} · {currentList.movieIds.length} película{currentList.movieIds.length!==1?"s":""}</div>}
                  </div>
                  {currentList&&<button onClick={()=>deleteList(currentList.id)} style={{background:"transparent",border:"1px solid #c09090",borderRadius:6,padding:"5px 12px",color:"#b06060",fontFamily:S.sans,fontSize:12,cursor:"pointer"}}>Eliminar lista</button>}
                </div>
              )}
              {tab==="biblioteca"&&(
                <>
                  <div style={{display:"flex",gap:6,flexWrap:"nowrap",overflowX:"auto",paddingBottom:10}}>
                    {allTags.map(t=>(
                      <button key={t} onClick={()=>setActiveTag(t)}
                        style={{background:activeTag===t?S.accent:"transparent",border:`1px solid ${activeTag===t?S.accent:S.border}`,borderRadius:20,padding:"4px 14px",color:activeTag===t?"#fff":S.muted,fontFamily:S.sans,fontSize:12,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,transition:"all .15s"}}>
                        {t}
                      </button>
                    ))}
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8,paddingBottom:8,flexWrap:"wrap"}}>
                    <span style={{fontSize:11,color:S.muted}}>Filtro:</span>
                    {["OR","AND"].map(m=>(
                      <button key={m} onClick={()=>setFilterMode(m)} style={{background:filterMode===m?S.accentLight:"transparent",border:`1px solid ${filterMode===m?S.accent:S.border}`,borderRadius:6,padding:"2px 10px",color:filterMode===m?S.accent:S.muted,fontFamily:S.sans,fontSize:11,cursor:"pointer"}}>
                        {m==="OR"?"Cualquiera":"Todos"}
                      </button>
                    ))}
                    <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                      {allGenres.map(g=><Tag key={g} label={g} active={filterGenres.includes(g)} onClick={()=>setFilterGenres(p=>p.includes(g)?p.filter(x=>x!==g):[...p,g])} sm/>)}
                    </div>
                    {filterGenres.length>0&&<button onClick={()=>setFilterGenres([])} style={{background:"transparent",border:"none",color:S.accent,fontFamily:S.sans,fontSize:11,cursor:"pointer",textDecoration:"underline"}}>limpiar</button>}
                  </div>
                </>
              )}
              {tab==="favoritas"&&<h2 style={{fontFamily:"'Lora',serif",fontSize:18,color:S.text,margin:"0 0 8px"}}>Favoritas</h2>}
              <div style={{display:"flex",alignItems:"center",gap:6,paddingBottom:10,flexWrap:"wrap"}}>
                <span style={{fontSize:11,color:S.muted}}>Ordenar:</span>
                {SORT_OPTIONS.map(o=>(
                  <button key={o.value} onClick={()=>setSort(o.value)}
                    style={{background:sort===o.value?S.accent:"transparent",border:`1px solid ${sort===o.value?S.accent:S.border}`,borderRadius:20,padding:"3px 12px",color:sort===o.value?"#fff":S.muted,fontFamily:S.sans,fontSize:11,cursor:"pointer",whiteSpace:"nowrap"}}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div style={{flex:1,overflowY:"auto",padding:tab==="estadisticas"?"0":"20px 24px"}}>
            {tab==="estadisticas"?<Stats/>
              :tab==="listas"&&!currentList?(
                <div style={{padding:"28px 0"}}>
                  <h2 style={{fontFamily:"'Lora',serif",fontSize:18,color:S.text,margin:"0 0 4px"}}>Mis listas</h2>
                  <p style={{fontSize:13,color:S.muted,margin:"0 0 20px"}}>Organizá tus películas en colecciones personalizadas</p>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:14}}>
                    {lists.map(l=>(
                      <div key={l.id} onClick={()=>setActiveList(l.id)} style={{background:S.card,border:`1px solid ${S.border}`,borderRadius:10,padding:"18px 20px",cursor:"pointer",transition:"border-color .15s"}}
                        onMouseEnter={e=>e.currentTarget.style.borderColor=S.accent}
                        onMouseLeave={e=>e.currentTarget.style.borderColor=S.border}>
                        <div style={{fontFamily:"'Lora',serif",fontSize:15,fontWeight:700,color:S.text,marginBottom:4}}>{l.name}</div>
                        <div style={{fontSize:12,color:S.muted}}>{l.description}</div>
                        <div style={{fontSize:11,color:S.accent,marginTop:8}}>{l.movieIds.length} película{l.movieIds.length!==1?"s":""}</div>
                      </div>
                    ))}
                    <div onClick={()=>setShowListModal(true)} style={{background:"transparent",border:`2px dashed ${S.border}`,borderRadius:10,padding:"18px 20px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:S.muted,fontFamily:S.sans,fontSize:13,transition:"border-color .15s"}}
                      onMouseEnter={e=>e.currentTarget.style.borderColor=S.accent}
                      onMouseLeave={e=>e.currentTarget.style.borderColor=S.border}>
                      + Nueva lista
                    </div>
                  </div>
                </div>
              ):<Grid/>}
          </div>
        </div>
        {tab!=="estadisticas"&&<DetailPanel/>}
      </div>
      {showForm&&<FormModal form={form} setForm={setForm} formGenres={formGenres} setFormGenres={setFormGenres} editingId={editingId} onSave={saveMovie} onClose={()=>setShowForm(false)} allGenres={allGenres}/>}
      {showListModal&&<NewListModal name={newListName} setName={setNewListName} desc={newListDesc} setDesc={setNewListDesc} onCreate={createList} onClose={()=>setShowListModal(false)}/>}
      {addToListMovie&&<AddToListModal movie={movies.find(m=>m.id===addToListMovie)} lists={lists} onToggle={toggleMovieInList} onClose={()=>setAddToListMovie(null)}/>}
      {showTagsModal&&<ManageTagsModal allGenres={allGenres} onAdd={addGenre} onDelete={deleteGenre} onClose={()=>setShowTagsModal(false)}/>}
    </div>
  );
}
