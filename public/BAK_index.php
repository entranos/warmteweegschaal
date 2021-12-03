
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="cache-control" content="no-store, no-cache"/>
  <title></title>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <!-- CSS -->
  <link rel="stylesheet" href="css/startpage.css"/>
</head>
<body>

<!-- Overall page -->
<div id="page">

  <!-- The information -->
  <div class="modal">

    <div class="modal-body">

      <p style="text-align:center"> Login viewer Startanalyse GA2.0</p>
      
      <div class="login">

        <form action="index.php" method="post">
          <input type="password" name="password" id="password" placeholder="Wachtwoord" required/>
          <input type="submit" value="Login">
        </form>

      </div>
   
      
    </div> <!-- modal-body -->
  </div>   <!-- modal -->

</div> <!-- div 'page' -->

<script>
msieversion();
function msieversion() {

    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");

    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))  // If Internet Explorer, return version number
    {
        alert('Je maakt gebruik van Microsoft Internet Explorer. Internet Explorer wordt niet meer ondersteund. Maak gebruik van een moderne browser zoals Chrome, Safari, Firefox of Edge.');
    }
    else  // If another browser, return 0
    {

    }

    return false;
}

</script>


</body>
</html>