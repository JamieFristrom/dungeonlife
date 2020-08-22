for _, inst in pairs( game.StarterGui:GetDescendants() ) do
    if( inst:IsA("TextButton") or inst:IsA("TextLabel") )then
        inst.Font = "Cartoon"
    end
end