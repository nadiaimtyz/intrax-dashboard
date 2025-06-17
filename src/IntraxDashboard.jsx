import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { UserCircle } from "lucide-react";
import Select from 'react-select';
import {
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer
} from 'recharts';

export default function IntraxDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const requiredNames = ["Raka", "Andi", "Sinta", "Semua Karyawan"];
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hasAbsen, setHasAbsen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileInfo, setShowProfileInfo] = useState(false);
  const [eventList, setEventList] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [suggestedTimes, setSuggestedTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [suggestedSlots, setSuggestedSlots] = useState([]);
  const [inputParticipant, setInputParticipant] = useState("");
  const [availability, setAvailability] = useState([
  { name: "Andi", free: ["09:00-10:00", "12:00-13:00", "14:00-15:00"] },
  { name: "Raka", free: ["10:00-11:00", "12:00-13:00", "14:00-15:00"] },
  { name: "Sinta", free: ["10:00-11:00", "15:00-17:00", "14:00-15:00"] },
  { name: "Semua Karyawan", free: ["15:00-17:00"]}
]);



const startRef = useRef(null);
const endRef = useRef(null);

const suggestBestSlot = (commonSlots) => {
  const weight = {
    "08:00-09:00": 1,
    "09:00-10:00": 3,
    "10:00-11:00": 4,
    "11:00-12:00": 5,
    "13:00-14:00": 4,
    "14:00-15:00": 3,
    "15:00-16:00": 2,
    "16:00-17:00": 1
  };

  // Urutkan berdasarkan skor tertinggi
  const sorted = commonSlots
    .map(slot => ({ slot, score: weight[slot] || 0 }))
    .sort((a, b) => b.score - a.score);

  return sorted.length > 0 ? sorted[0].slot : null;
};


useEffect(() => {
    if (selectedParticipants.length > 0) {
      const suggested = getCommonAvailability(selectedParticipants, availability);
      setSuggestedTimes(suggested);
    } else {
      setSuggestedTimes([]);
    }
  }, [selectedParticipants]);

const getCommonAvailability = (selectedPeople, availabilityData) => {
  const selectedAvailability = availabilityData.filter((person) =>
    selectedPeople.includes(person.name)
  );

  const allSlots = selectedAvailability.map((p) => p.free);

  if (allSlots.length === 0) return [];

  return allSlots.reduce((a, b) => a.filter(x => b.includes(x)));
};

const handleAddEvent = (e) => {
  e.preventDefault();

  const title = document.querySelector('input[name="title"]').value;
  const date = document.querySelector('input[name="date"]').value;
  const start = startRef.current?.value;
  const end = endRef.current?.value;
  const location = document.querySelector('input[name="location"]').value;

  if (!title || !date || !start || !end || participants.length === 0) {
    alert("Semua field harus diisi!");
    return;
  }

  const datetime = `${date}, ${start} - ${end}`;

  const newEvent = {
    title,
    datetime,
    duration: `${start}–${end}`,
    location,
    participants: participants.map(p => p.label),
    status: 'Menunggu Konfirmasi'
  };

  setEventList(prev => [...prev, newEvent]);

  // Reset form
  document.querySelector('form').reset();
  setParticipants([]);
  setSuggestedTimes([]);
};

const [izinList, setIzinList] = useState([]); // state untuk daftar izin

 const handleAjukanIzin = (e) => {
  e.preventDefault();
  
  const tanggalInput = document.querySelector('input[type="date"]').value;
  const alasan = document.querySelector('select').value;

  if (!tanggalInput || !alasan) {
    alert("Tanggal dan alasan harus diisi.");
    return;
  }

  const tanggalFormatted = formatDate(new Date(tanggalInput));

  const newRecord = {
    date: tanggalFormatted,
    time: "-", // karena ini izin
    status: alasan,
    location: "-",
  };

  setAbsensiHistory((prev) => [...prev, newRecord]);
};

  const formatTime = (date) => {
    return new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  };
  
  const [csTickets, setCSTickets] = useState([
  {
    sender: "Bayu",
    issue: "Saldo tidak bertambah setelah top-up",
    status: "Dialihkan ke CS",
    time: "09:21 WIB",
    sla: "0.2/24",
    resolvedBy: "Menunggu CS...",
    id: "1",
  },
  {
    sender: "Tania",
    issue: "Lupa password akun",
    status: "Diselesaikan oleh Chatbot",
    time: "09:25 WIB",
    sla: "0.1/24",
    resolvedBy: "Diselesaikan oleh Chatbot",
    id: "2",
  },
  {
    sender: "Rizky",
    issue: "Ingin menghapus akun",
    status: "Sedang dibalas Chatbot",
    time: "09:30 WIB",
    sla: "-",
    resolvedBy: "-",
    id: "3",
  },
  {
    sender: "Salsa",
    issue: "Verifikasi email tidak berhasil",
    status: "Diselesaikan oleh CS",
    time: "10:00 WIB",
    sla: "0.3/24",
    resolvedBy: "CS Ayu",
    id: "4",
  },
  {
    sender: "Yoga",
    issue: "Pengembalian dana gagal",
    status: "Sedang dibalas Chatbot",
    time: "10:15 WIB",
    sla: "-",
    resolvedBy: "-",
    id: "5",
  },
]);
  const handleTandaiSelesai = (id) => {
    const updated = csTickets.map((t) => {
      if (t.id === id) {
        return {
          ...t,
          status: "Diselesaikan oleh CS",
          resolvedBy: "CS Raka",
          sla: "0.5/24" // placeholder untuk SLA, bisa dihitung dari waktu
        };
      }
      return t;
    });
    setCSTickets(updated);
  };
  
  const kompetensiData = [
  { domain: "Komunikasi", value: 40 },
  { domain: "Kepemimpinan", value: 60 },
  { domain: "Manajemen Waktu", value: 80 },
  { domain: "Kreativitas", value: 50 },
  { domain: "Kolaborasi", value: 70 },
  { domain: "Adaptabilitas", value: 65 }
];

 const allPeople = [
  { value: 'Andi', label: 'Andi' },
  { value: 'Raka', label: 'Raka' },
  { value: 'Sinta', label: 'Sinta' },
  { value: 'Semua Karyawan', label: 'Semua Karyawan'},
];
  
  const badgesAchieved = [
    "🎖️Komunikasi Dasar",
    "🎖️Teamwork Solid",
    "🎖️Task Management Pro",
    "🎖️Google Workspace Master"
  ];
   const renderBadges = () => (
    <div className="bg-[#fff9e6] p-4 rounded shadow">
      <h4 className="text-md font-semibold mb-2">🎖️ Badge yang Sudah Dicapai</h4>
      <div className="flex flex-wrap gap-2">
        {badgesAchieved.map((badge, i) => (
          <span key={i} className="text-sm bg-white border px-3 py-1 rounded-full shadow text-gray-800">
            {badge}
          </span>
        ))}
      </div>
    </div>
  );

const findSuggestedSlots = () => {
  if (participants.length === 0) return;

  const selectedNames = participants.map(p => p.label || p.value); // untuk react-select
  const selected = availability.filter(a => selectedNames.includes(a.name));

  if (selected.length === 0) return;

  const allFreeSlots = selected.map(a => a.free);

  if (allFreeSlots.length === 0) return [];

  // Kalau hanya 1 peserta, return langsung
  if (allFreeSlots.length === 1) return allFreeSlots[0];

  // Kalau lebih dari 1 peserta, reduce
  return allFreeSlots.reduce((a, b) => a.filter(x => b.includes(x)));
};


const [absensiHistory, setAbsensiHistory] = useState([
  {
    date: "Senin, 2 Juni 2025",
    time: "",
    status: "Tidak Hadir",
    location: "-"
  },
  {
    date: "Selasa, 3 Juni 2025",
    time: "08.57",
    status: "Hadir (Tepat Waktu)",
    location: "Kantor Pusat"
  },
  {
    date: "Rabu, 4 Juni 2025",
    time: "09.01",
    status: "Hadir (Terlambat)",
    location: "Kantor Pusat"
  },
  {
    date: "Kamis, 5 Juni 2025",
    time: "08.00",
    status: "sakit",
    location: "-"
  },
  {
    date: "Jumat, 6 Juni 2025",
    time: "08.00",
    status: "Izin",
    location: "-"
  }
]);

 const [tanggal, setTanggal] = useState("");
  const [alasan, setAlasan] = useState("");
  const [file, setFile] = useState(null);

  const scheduleToday = [
  { time: "09.00 - 10:00", activity: "Workshop Soft Skill" },
  { time: "13.00 - 14:00", activity: "Rapat Evaluasi Divisi" }
];

  const unreadMessages = 2;

 const [lokasiValid, setLokasiValid] = useState(null);
  const kantorLat = -7.77371; // Koordinat simulasi kantor
  const kantorLng = 110.38624;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);


 const formatDate = (date) => {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  } catch {
    return "-";
  }
};

const getSuggestedTimes = () => {
  const freeSlots = {};

  participants.forEach((name) => {
    const user = availability.find((u) => u.name === name);
    if (!user) return;
    user.free.forEach((slot) => {
      if (freeSlots[slot]) {
        freeSlots[slot].push(name);
      } else {
        freeSlots[slot] = [name];
      }
    });
  });

  // Only show slots where all participants are available
  return Object.entries(freeSlots)
    .filter(([_, names]) => names.length === participants.length)
    .map(([time]) => time);
};

const handleTambahEvent = (e) => {
  e.preventDefault();
  const form = e.target.form;
  const title = form[0].value;
  const date = form[1].value;
  const start = form[2].value;
  const end = form[3].value;
  const location = form[4].value;

  const newEvent = {
    title,
    datetime: `${formatDate(date)}, ${start} - ${end}`,
    location,
    participants,
    status: "Menunggu Konfirmasi",
  };

  setEventList((prev) => [...prev, newEvent]);
  setParticipants([]);
  form.reset();
};
  
const handleConfirmEvent = (index) => {
  setEventList(prev =>
    prev.map((event, i) =>
      i === index
        ? { ...event, status: "Terjadwal" }
        : event
    )
  );
};

const renderSuggestions = () => {
  const slots = getSuggestedTimes();
  return (
    <div className="mt-4">
      <h4 className="text-sm font-semibold">Suggested Times</h4>
      {slots.length > 0 ? (
        <ul className="list-disc ml-5 text-sm mt-1">
          {slots.map((slot, i) => (
            <li key={i}>{slot}</li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-gray-500 italic">Tidak ada waktu cocok.</p>
      )}
    </div>
  );
};

// ================== RENDER EVENT LIST ==================
const renderEventList = () => (
  <div className="space-y-3">
{eventList.map((event, index) => (
  <div key={index} className="bg-[#dfe6e9] p-4 rounded shadow">
    <p className="text-sm font-semibold">{event.title}</p>
    <p className="text-sm text-gray-700">
      🕒 {event.datetime} ({event.duration || "-"})
    </p>
    <p className="text-xs text-gray-500">
      Peserta: {event.participants.join(", ")}
    </p>
    <p className="text-xs text-gray-600">Status: {event.status}</p>
  </div>
))}
  </div>
);

  const isLate = (date) => {
    const hour = date.getHours();
    const minute = date.getMinutes();
    return hour > 9 || (hour === 9 && minute > 0);
  };
   const handleAbsensi = () => {
    if (!navigator.geolocation) {
      alert("Geolocation tidak didukung di browser ini.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const distance = Math.sqrt(
          Math.pow(latitude - kantorLat, 2) + Math.pow(longitude - kantorLng, 2)
        );

        if (distance > 0.01) {
          alert("Anda berada di luar area kantor. Absen ditolak.");
          setLokasiValid(false);
          return;
        }

        setLokasiValid(true);
        const dateNow = new Date();
        const newRecord = {
          date: formatDate(dateNow),
          time: formatTime(dateNow),
          status: isLate(dateNow) ? "Hadir (Terlambat)" : "Hadir (Tepat Waktu)",
          location: "Kantor Pusat"
        };
        setHasAbsen(true);
        setAbsensiHistory((prev) => [newRecord, ...prev]);
      },
      () => {
        alert("Gagal mendapatkan lokasi.");
        setLokasiValid(false);
      }
    );
  };

  
   const contentContainerStyle = {
    marginLeft: '16rem', // adjust to sidebar width
    width: '100%',
    padding: '2rem'
  };

  const [buktiAktivitas, setBuktiAktivitas] = useState([]);
  const handleUploadBukti = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBuktiAktivitas((prev) => [...prev, { fileName: file.name, date: new Date().toLocaleDateString("id-ID") }]);
    }
  };

   const priorityLevels = ["Tinggi", "Sedang", "Rendah"];
  const colorMap = {
    "Tinggi": "bg-red-200 text-red-700",
    "Sedang": "bg-yellow-200 text-yellow-700",
    "Rendah": "bg-green-200 text-green-700"
  };

   const navItems = [
    { key: "dashboard", label: "Dashboard" },
    { key: "absensi", label: "E-Absensi" },
    { key: "cs", label: "Customer Service" },
    { key: "event", label: "Event" },
    { key: "training", label: "Training" }
  ];
  
  const renderEventForm = () => {
  const bestTime = suggestBestSlot(suggestedTimes);

  return (
    <form onSubmit={handleAddEvent} className="space-y-4">
      <input name="title" type="text" placeholder="Judul Event" className="w-full border rounded p-2 text-sm" />

      <div className="flex gap-2">
        <input name="date" type="date" className="border rounded p-2 text-sm" />
        <input name="start" type="time" ref={startRef} className="border rounded p-2 text-sm" />
        <span className="self-center">-</span>
        <input name="end" type="time" ref={endRef} className="border rounded p-2 text-sm" />
      </div>

      <input name="location" type="text" placeholder="Lokasi Event" className="w-full border rounded p-2 text-sm" />

      <div>
        <p className="text-sm font-medium mb-1">👥 Tambah Peserta</p>
        <Select
          isMulti
          options={allPeople}
          value={participants}
          onChange={(selected) => {
            setParticipants(selected);
            const names = selected.map(s => s.label); // asumsi label = nama
            const result = getCommonAvailability(names, availability);
            setSuggestedTimes(result);
          }}
          className="mb-2 text-sm"
        />
      </div>

      {bestTime && (
        <div className="bg-[#f1f8e9] p-3 rounded text-sm text-[#33691E] shadow">
          🧠 Waktu terbaik: <strong>{bestTime}</strong>
          <button
            type="button"
            className="ml-3 underline"
            onClick={() => {
              const [start, end] = bestTime.split("-");
              if (startRef.current) startRef.current.value = start;
              if (endRef.current) endRef.current.value = end;
            }}
          >
            Gunakan waktu ini
          </button>
        </div>
      )}

      <Button type="submit" size="sm" className="bg-[#6C5CE7] text-white hover:bg-[#5f27cd]">
        + Tambah Event
      </Button>
    </form>
  );
};
  
  const renderContent = () => {
    switch (activeTab) {
case "dashboard":
  return (
    <Card className="shadow-md border bg-white">
      <CardContent className="p-6 text-[#2d3436] font-['Poppins'] space-y-4">
        <h2 className="text-xl font-bold mb-2">Selamat datang, Raka!</h2>
        <p className="text-sm text-gray-600">Gunakan dashboard ini untuk melihat ringkasan aktivitas Anda.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-4 mt-4">
        <div className="bg-[#fab1a0] p-4 shadow rounded-lg min-h-[100px]">
          <p className="text-sm text-gray-600">📍 Status Absensi</p>
          <p className="text-lg font-semibold">
            {hasAbsen ? "✅ Sudah Absen" : "❌ Belum Absen"}
          </p>
        </div>
        <div className="bg-[#ffeaa7] p-4 shadow rounded-lg min-h-[100px]">
          <p className="text-sm text-gray-600">💬 Chat Customer</p>
          <p className="text-lg font-semibold">1 Tiket Menunggu</p>
        </div>
        <div className="bg-[#55efc4] p-4 shadow rounded-lg min-h-[100px]">
          <p className="text-sm text-gray-600">🎓 Progres Training</p>
          <p className="text-lg font-semibold">6/6 Modul Tersedia</p>
        </div>
      </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-[#dff9fb] p-4 rounded shadow">
            <p className="text-sm text-gray-600">📅 Jadwal Hari Ini</p>
            <ul className="text-sm mt-1 list-disc list-inside">
              {scheduleToday.map((item, idx) => (
                <li key={idx}><strong>{item.time}</strong> - {item.activity}</li>
              ))}
            </ul>
          </div>
          <div className="bg-[#dfe6e9] p-4 rounded shadow">
            <p className="text-sm text-gray-600">🎖️ Badge Tercapai</p>
            <div className="flex flex-wrap gap-2">
              {badgesAchieved.map((badge, index) => (
                <div key={index} className="bg-white border border-[#6C5CE7] text-[#341f97] px-3 py-1 text-xs rounded-full shadow">
                  {badge}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-[#74b9ff] p-4 rounded text-white shadow">
            <h4 className="font-semibold mb-1">Informasi Akun</h4>
            <p className="text-sm">Nama: Raka Firmansyah</p>
            <p className="text-sm">Divisi: Operasional & SDM</p>
            <p className="text-sm">Email: raka@intrax.co.id</p>
          </div>
          <div className="bg-[#6c5ce7] p-4 rounded text-white shadow">
            <h4 className="font-semibold mb-1">Pengumuman</h4>
            <p className="text-sm">📢 Pelatihan internal akan dimulai 5 Juni. Pastikan Anda sudah registrasi!</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
      case "absensi":
  return (
    <Card className="shadow-md border bg-white">
      <CardContent className="p-6 font-['Poppins'] space-y-6">
        <h3 className="text-lg font-bold">E-Absensi</h3>
        <p className="text-sm text-gray-600">Pastikan Anda di area kantor untuk bisa konfirmasi kehadiran</p>

        <div className="bg-[#dff9fb] p-4 rounded shadow mt-4">
          <p className="text-sm text-gray-600">Tanggal: <span className="font-semibold">{formatDate(currentTime)}</span></p>
          <p className="text-sm text-gray-600">Waktu Sekarang: <span className="font-semibold">{formatTime(currentTime)}</span></p>
          <p className="text-sm text-gray-600">Status Absensi: <span className="font-semibold">{hasAbsen ? "Sudah Absen" : "Belum Absen"}</span></p>
        </div>

        {/* Lokasi Realtime dengan Peta Mini */}
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-[#341f97] mb-2">📍 Lokasi Anda Saat Ini</h4>
          <div className="bg-gray-100 border text-sm text-gray-600 p-4 rounded">
            <iframe
              width="100%"
              height="200"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src={`https://maps.google.com/maps?q=${kantorLat},${kantorLng}&z=15&output=embed`}
              title="Peta Lokasi Kantor"
            ></iframe>
            ❗Anda berada jauh dari kantor. Absen ditolak / ✅Anda berada di area kantor. Silahkan konfirmasi kehadiran
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mt-4">
          {!hasAbsen ? (
            <Button
              onClick={handleAbsensi}
              className="bg-[#6C5CE7] text-white hover:bg-[#5f27cd] w-full md:w-auto"
            >
              Konfirmasi Kehadiran
            </Button>
          ) : (
            <div className="bg-green-100 text-green-700 text-sm rounded p-3 border border-green-300 w-full md:w-auto">
              Terima kasih, kehadiran Anda telah tercatat pada pukul {formatTime(currentTime)}.
              <div className="text-sm text-gray-600 mt-2">
                📍 Lokasi: <span className="font-semibold">Kantor Pusat</span><br />
                📅 Status Kehadiran: <span className="font-semibold">{isLate(currentTime) ? "Terlambat" : "Tepat Waktu"}</span>
              </div>
              {isLate(currentTime) && (
                <p className="text-xs text-red-600 mt-1">
                  ⚠️ Anda terlambat. Harap disiplin ke depannya.
                </p>
              )}
            </div>
          )}
        </div>
        
         <div className="p-6">
      <div className="mt-6 bg-[#f8f9fa] p-4 rounded border">
        <h4 className="font-semibold text-sm mb-2">📝 Formulir Pengajuan Izin</h4>
        <form className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600">Tanggal Izin</label>
            <input
              type="date"
              className="border rounded p-2 w-full text-sm"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600">Alasan</label>
            <select
              className="border rounded p-2 w-full text-sm"
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
            >
              <option value="">Pilih Alasan</option>
              <option value="Sakit">Sakit</option>
              <option value="Izin">Izin</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600">Upload Bukti</label>
            <input
              type="file"
              className="w-full text-sm"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>
          <button
            onClick={handleAjukanIzin}
            className="bg-[#6C5CE7] text-white hover:bg-[#5f27cd] px-4 py-2 rounded text-sm"
          >
            Ajukan Izin
          </button>
        </form>
      </div>

      <div className="mt-8">
        <h4 className="text-md font-semibold text-[#341f97] mb-2">
          🗂️ Riwayat Absensi
        </h4>
        <table className="min-w-full bg-white text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">Tanggal</th>
              <th className="p-2">Waktu</th>
              <th className="p-2">Status</th>
              <th className="p-2">Lokasi</th>
              <th className="p-2">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {absensiHistory.map((record, index) => {
              const keterangannya = record.status === "Sakit"
                ? "Sakit (Pending)"
                : record.status === "sakit"
                ? "Sakit (Konfirmasi)"
                : record.status === "Izin"
                ? "Izin (Pending)"
                : record.status === "Hadir (Terlambat)"
                ? "Terlambat"
                : record.status === "Hadir (Tepat Waktu)"
                ? "Tepat Waktu"
                : "Tidak Hadir";
              return (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-2">{record.date}</td>
                  <td className="p-2">{record.time}</td>
                  <td className="p-2">{record.status}</td>
                  <td className="p-2">{record.location}</td>
                  <td className="p-2">{keterangannya}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
      </CardContent>
    </Card>
  );
      case "cs":
        return (
            <Card className="shadow-md border bg-white">
              <CardContent className="p-6 font-['Poppins'] space-y-6">
                <h3 className="text-lg font-bold">Daftar Tiket Customer Service</h3>
                <p className="text-sm text-gray-600">Pantau dan kelola tiket keluhan pelanggan secara efisien.</p>
        
                <div className="overflow-x-auto mt-4">
                  <table className="min-w-full text-sm text-left">
                    <thead>
                      <tr className="bg-gray-100 text-center">
                        <th className="py-2 px-4">Nama Pengirim</th>
                        <th className="py-2 px-4">Masalah</th>
                        <th className="py-2 px-4">Status</th>
                        <th className="py-2 px-4">SLA</th>
                        <th className="py-2 px-4">Diselesaikan Oleh</th>
                        <th className="py-2 px-4">Aksi</th>
                        <th className="py-2 px-4">Feedback</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csTickets.map((ticket, index) => (
                        <tr key={index} className="border-t">
                          <td className="py-2 px-4">{ticket.sender}</td>
                          <td className="py-2 px-4">{ticket.issue}</td>
                          <td className="py-2 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              ticket.status === 'Sedang dibalas Chatbot'
                                ? 'bg-yellow-100 text-yellow-700'
                                : ticket.status === 'Diselesaikan oleh Chatbot'
                                ? 'bg-blue-100 text-blue-700'
                                : ticket.status === 'Dialihkan ke CS'
                                ? 'bg-red-100 text-red-700'
                                : ticket.status === 'Diselesaikan oleh CS'
                                ? 'bg-green-200 text-green-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {ticket.status}
                            </span>
                          </td>
                          <td className="py-2 px-4">{ticket.sla}</td>
                          <td className="py-2 px-4">{ticket.resolvedBy || '-'}</td>
                          <td className="py-2 px-4 flex gap-2">
                            <Button size="sm" className="bg-[#6C5CE7] text-white hover:bg-[#5f27cd]">
                              Lihat Chat
                            </Button>
                            {ticket.status === 'Dialihkan ke CS' && (
                              <Button
                                size="sm"
                                className="bg-[#5f27cd] text-white hover:bg-[#6C5CE7]"
                                onClick={() => handleTandaiSelesai(ticket.id)}
                              >
                                Tandai Selesai
                              </Button>
                            )}
                            {ticket.status === 'Diselesaikan oleh CS' && (
                              <span className="text-green-600 font-semibold text-sm ml-2">Selesai</span>
                            )}
                            {ticket.status === 'Diselesaikan oleh Chatbot' && (
                              <span className="text-green-600 font-semibold text-sm ml-2">Selesai</span>
                            )}
                            {ticket.status === 'Sedang dibalas Chatbot' && (
                              <span className="text-grey-600 font-semibold text-sm ml-2">Otomatis</span>
                            )}
                          </td>
                         <td className="py-2 px-4">
        {/* Feedback manual berdasarkan index */}
        {ticket.status === 'Diselesaikan oleh Chatbot' && ticket.sender === "Tania" && "⭐⭐⭐⭐⭐"}
        {ticket.status === 'Diselesaikan oleh CS' && ticket.sender === "Salsa" && "⭐⭐⭐⭐"}
        {ticket.status === 'Diselesaikan oleh CS' && ticket.sender === "Bayu" && "Belum ada"}
        {(ticket.status !== 'Diselesaikan oleh Chatbot' && ticket.status !== 'Diselesaikan oleh CS') && "Belum ada"}
      </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          );
     case "event":
  return (
    <Card className="shadow-md border bg-white">
      <CardContent className="p-6 font-['Poppins'] space-y-6">
        <h3 className="text-lg font-bold">Event</h3>
        <p className="text-sm text-gray-600">
  Pilih peserta dan sistem akan merekomendasikan waktu terbaik secara otomatis berdasarkan ketersediaan mereka.
</p>

        <h4 className="text-md font-semibold text-[#341f97] mb-2 mt-4">
          📅 Buat Event Baru
        </h4>
        {renderEventForm()}

        <div>
          <h4 className="text-md font-semibold text-[#341f97] mb-2 mt-6">
            📅 Daftar Event
          </h4>
          <div className="space-y-3">
            {/* Event statis */}
            <div className="bg-[#dfe6e9] p-4 rounded shadow">
              <p className="text-sm font-semibold">Workshop Soft Skill</p>
              <p className="text-sm text-gray-700">
                🗓 5 Juni 2025, 09:00 - 10:00 WIB
              </p>
              <p className="text-xs text-gray-500">Status: Terjadwal</p>
            </div>
            <div className="bg-[#dfe6e9] p-4 rounded shadow">
              <p className="text-sm font-semibold">Rapat Evaluasi Divisi</p>
              <p className="text-sm text-gray-700">
                🗓 7 Juni 2025, 13:00 - 14:00 WIB
              </p>
              <p className="text-xs text-gray-500">Status: Terjadwal</p>
            </div>

            {/* Dynamic Event List */}
            {eventList.map((event, index) => (
              <div key={index} className="bg-[#dfe6e9] p-4 rounded shadow">
                <p className="text-sm font-semibold">{event.title}</p>
                <p className="text-sm text-gray-700">
                  🕒 {event.datetime} ({event.duration || "-"})
                </p>
                <p className="text-xs text-gray-500">
                  Peserta: {Array.isArray(event.participants)
                    ? event.participants.map((p) => (p.label ? p.label : p)).join(", ")
                    : "-"}
                </p>
                <p className="text-xs text-gray-600">Status: {event.status}</p>




{event.status !== "Terjadwal" &&
    <button
      onClick={() =>
        handleConfirmEvent(index)
      }
      className="text-xs bg-green-500 text-white px-2 py-1 mt-2 rounded"
    >
      Konfirmasi Kehadiran
    </button>
}

              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
        
case "training":
  return (
    <Card className="shadow-md border bg-white">
      <CardContent className="p-6 font-['Poppins'] space-y-6">
        <h3 className="text-lg font-bold">Training</h3>

        {/* Section: Evaluasi Kompetensi Awal */}
        <div className="bg-[#f9f9f9] p-4 rounded shadow space-y-3 mt-4">
          <h4 className="text-md font-semibold">📋 Evaluasi Kompetensi Awal</h4>
          <p className="text-sm text-gray-600">Isi evaluasi berikut untuk mengetahui kompetensi dan rekomendasi pelatihanmu.</p>
          <Button className="mt-4 bg-[#5f27cd] text-white hover:bg-[#6C5CE7]">Isi Evaluasi</Button>
        </div>

        {/* Section: Kompas Kompetensi */}
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          {/* Soft Skills */}
          <div className="bg-[#eef1ff] p-4 rounded shadow space-y-3">
            <h4 className="text-md font-semibold">🧭 Kompas Kompetensi – Soft Skills</h4>
            <p className="text-sm text-gray-600">Kelebihan dan kelemahan kamu berdasarkan evaluasi</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={kompetensiData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="domain" tick={{ fontSize: 10, fill: "#636e72", fontFamily: "Poppins" }} />
                  <PolarRadiusAxis angle={20} domain={[0, 100]} />
                  <Radar name="Kompetensi" dataKey="value" stroke="#6C5CE7" fill="#6C5CE7" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Hard Skills */}
          <div className="bg-[#eafaf1] p-4 rounded shadow space-y-3">
            <h4 className="text-md font-semibold">🛠️ Kompas Kompetensi – Hard Skills</h4>
            <p className="text-sm text-gray-600">Kelebihan dan kelemahan kamu berdasarkan evaluasi</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                  { skill: "Google Workspace", value: 60 },
                  { skill: "Digital Communication", value: 45 },
                  { skill: "Task Management", value: 70 },
                  { skill: "Cybersecurity", value: 50 },
                  { skill: "Data Literacy", value: 40 },
                  { skill: "Digital Problem Solving", value: 55 }
                ]}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10, fill: "#2d3436", fontFamily: "Poppins" }} />
                  <PolarRadiusAxis angle={20} domain={[0, 100]} />
                  <Radar name="Hard Skills" dataKey="value" stroke="#00B894" fill="#00B894" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Section: Rekomendasi Pelatihan */}
        <div className="bg-[#f9f9f9] p-4 rounded shadow space-y-4">
        <h4 className="text-md font-semibold">📌 Rekomendasi Kamu</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[ 
            { title: "Public Speaking 101", desc: "Untuk meningkatkan komunikasi verbal", color: "bg-[#e8f0fe]", progress: 80 },
            { title: "Effective Email Writing", desc: "Untuk komunikasi tertulis yang efektif", color: "bg-[#fef9e7]", progress: 40 },
            { title: "Creative Problem Solving", desc: "Untuk mengasah pemecahan masalah", color: "bg-[#eafaf1]", progress: 60 },
            { title: "Data Literacy for Beginners", desc: "Penting untuk memahami data dasar", color: "bg-[#fff0f5]", progress: 20 },
            { title: "Cybersecurity Awareness", desc: "Menjaga keamanan digital pribadi & perusahaan", color: "bg-[#f0ffff]", progress: 50 },
            { title: "Remote Communication Tools", desc: "Untuk kolaborasi jarak jauh yang efisien", color: "bg-[#f9f9f9]", progress: 0 },
          ].map((item, i) => (
            <div key={i} className={`${item.color} border rounded shadow p-4 hover:bg-gray-50 transition`}>
              <h5 className="font-semibold text-sm mb-1">{item.title}</h5>
              <p className="text-xs text-gray-500 mb-2">{item.desc}</p>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div className="bg-[#6C5CE7] h-full" style={{ width: `${item.progress}%` }}></div>
              </div>
              <p className="text-xs text-right text-gray-500 mt-1">{item.progress}%</p>
              <Button size="sm" className="mt-3 bg-[#6C5CE7] text-white hover:bg-[#5f27cd] w-full">Lihat Modul</Button>
            </div>
          ))}
        </div>
      </div>

        <div className="bg-[#fffbea] p-4 rounded shadow space-y-2">
  <h4 className="text-md font-semibold text-[#341f97]">🎖️ Badge yang Sudah Dicapai</h4>
  <p className="text-sm text-gray-600 mb-2">Berikut merupakan pencapaian pelatihan Anda sejauh ini.</p>
  <div className="flex flex-wrap gap-2">
    {badgesAchieved.map((badge, index) => (
      <div key={index} className="bg-white border border-[#6C5CE7] text-[#341f97] px-3 py-1 text-xs rounded-full shadow">
        {badge}
      </div>
    ))}
  </div>
</div>
  </CardContent>
</Card>
  );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfbfb] to-[#ebedee] font-['Poppins']">
      <header className="w-full bg-[#341f97] shadow-md px-6 py-4 flex items-center justify-between text-white">
        <h1 className="text-2xl font-bold tracking-wide"></h1>
        <div className="relative flex items-center gap-4">
          {/* Tombol Notif */}
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="relative focus:outline-none"
          >
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">1</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 17.25a3 3 0 01-6 0m6 0H6.75m7.5 0h3a2.25 2.25 0 002.25-2.25v-4.5a6.75 6.75 0 10-13.5 0v4.5A2.25 2.25 0 006.75 17.25h3" />
            </svg>
          </button>

          {showNotif && (
    <div className="absolute top-12 right-0 bg-[#6C5CE7] text-white p-4 rounded shadow-lg w-64 z-50">
      <h4 className="font-bold mb-1">📢 Pengumuman</h4>
      <p className="text-sm leading-snug">
        Pelatihan internal akan dimulai <strong>5 Juni</strong>. Pastikan Anda sudah registrasi!
      </p>
    </div>
  )}

           {/* 👤 Tombol Profile (UserCircle + Nama) */}
    <div className="relative">
      <button
        onClick={() => setShowProfileInfo(!showProfileInfo)}
        className="flex items-center gap-2 hover:opacity-80 transition"
      >
        <UserCircle className="w-6 h-6 text-white" />
        <span className="text-sm font-medium">Raka Firmansyah</span>
      </button>

      {/* 📄 Popup Info Akun */}
      {showProfileInfo && (
        <div className="absolute right-0 mt-2 bg-[#74b9ff] text-white p-4 rounded shadow-lg z-50 w-64">
          <h4 className="font-bold mb-2">📄 Informasi Akun</h4>
          <p className="text-sm"><span className="font-semibold">Nama:</span> Raka Firmansyah</p>
          <p className="text-sm"><span className="font-semibold">Divisi:</span> Operasional & SDM</p>
          <p className="text-sm"><span className="font-semibold">Email:</span> raka@intrax.co.id</p>
        </div>
      )}
    </div>

    {/* Tombol Logout */}
     <button
  onClick={onLogout}
  className="bg-[#6C5CE7] hover:bg-[#5f27cd] text-white px-4 py-2 rounded-md shadow transition z-50 relative"
>
  Logout
</button>


  </div>
</header>


      <div className="flex">
        <aside className="w-64 bg-[#341f97] text-white p-5 space-y-4 h-screen fixed top-0 left-0 z-50">
        <div className="flex items-center justify-center gap-2 mt-2 pb-4 border-b border-white/30 mb-3">
          <span className="text-2xl"></span>
          <h2 className="text-2xl font-bold tracking-wide text-center">INTRAX</h2>
        </div>
          <nav className="space-y-3">
            {navItems.map((item) => (
              <button
                key={item.key}
                className={`block w-full text-left px-3 py-2 rounded-lg transition-all ${
                  activeTab === item.key
                    ? "bg-white text-[#341f97] font-semibold shadow"
                    : "hover:bg-[#5f27cd] hover:text-white"
                }`}
                onClick={() => setActiveTab(item.key)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <div style={contentContainerStyle}>
          {renderContent()}
        </div>
      </div>

      <footer className="text-center text-xs text-gray-400 py-4">
        © 2025 INTRAX. All rights reserved.
      </footer>
    </div>
  );
}
