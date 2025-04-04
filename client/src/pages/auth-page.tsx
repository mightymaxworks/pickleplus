import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-center mb-6 text-[#FF5722]">PICKLE+</h1>
      <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Login />
        </TabsContent>
        <TabsContent value="register">
          <Register />
        </TabsContent>
      </Tabs>
    </div>
  );
}